"""Import public catalog facts and numbered diagram coordinates for Accord LX KL 5AT.
No account requests or purchases. Cached page data stays outside the checkout.
"""
import concurrent.futures, hashlib, json, re, time, urllib.request
from pathlib import Path
from datetime import datetime, timezone
BASE='https://www.hondapartsnow.com'
ROOT=Path(__file__).resolve().parents[1]
CACHE=Path('/tmp/accord-catalog-cache');CACHE.mkdir(exist_ok=True)
ASSETS=ROOT/'dist/assets/diagrams';ASSETS.mkdir(parents=True,exist_ok=True)
links=json.loads(Path('/tmp/accord-diagram-links.json').read_text())
links=[d for d in links if '/2012-honda-accord--4dr_lx-kl_5at/' in d['url']]

def request(url):
 for attempt in range(3):
  try:
   with urllib.request.urlopen(url,timeout=35) as r:return r.read()
  except urllib.error.HTTPError as e:
   if e.code in (401,403,429):raise
   if attempt==2:raise
   time.sleep(1+attempt)
  except Exception:
   if attempt==2:raise
   time.sleep(1+attempt)

def flatten(items):
 for v in items:
  if isinstance(v,list):yield from flatten(v)
  elif isinstance(v,dict):yield v

def extract(item):
 slug=item['url'].split('/')[-2]+'--'+item['url'].split('/')[-1][:-5]
 cache=CACHE/(slug+'.json')
 if cache.exists():return json.loads(cache.read_text())
 url=BASE+item['url'];raw=request(url).decode()
 match=re.search(r'<script[^>]*id="initialState"[^>]*>(.*?)</script>',raw,re.S)
 if not match:raise ValueError('No published catalog data: '+slug)
 data=match.group(1).split('=',1)[1].strip().rstrip(';')
 data=re.sub(r'(?<=:)undefined(?=[,}])','null',data)
 state=json.loads(data)['partList']
 diagrams=[]
 for i,d in enumerate(state.get('diagramList',[])):
  remote=BASE+(d.get('largeImg') or d.get('img'))
  file=ASSETS/(slug+'-'+str(i)+'.png')
  if not file.exists():file.write_bytes(request(remote))
  diagrams.append({'id':d['id'],'name':d['name'],'image':'./assets/diagrams/'+file.name,'sourceImage':remote,'hotspots':d.get('hotSpotList',[])})
 rows=[];seen=set()
 for part in flatten(state.get('partList',[])):
  key=(part.get('partNumber'),part.get('code'),part.get('auxiliaryDesc'))
  if key in seen:continue
  seen.add(key)
  rows.append({'number':part.get('partNumber'),'name':part.get('mainDesc') or part.get('pncDesc'),'ref':part.get('code',''),'url':BASE+part['url'],'images':[BASE+p for p in part.get('pictures',[])], 'qualifiers':part.get('subDescList',[]), 'extra':part.get('allExtraInfoList',[]), 'note':part.get('auxiliaryDesc') or '', 'replacement':part.get('replace') or ''})
 result={'id':slug,'name':item['name'].strip(),'category':item['url'].split('/')[-2],'url':url,'diagrams':diagrams,'parts':rows}
 cache.write_text(json.dumps(result,separators=(',',':')))
 return result

items=[];errors=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 futures={pool.submit(extract,item):item for item in links}
 for future in concurrent.futures.as_completed(futures):
  item=futures[future]
  try:items.append(future.result())
  except Exception as e:errors.append({'name':item['name'],'url':BASE+item['url'],'error':str(e)});print('ERROR',item['name'],str(e),flush=True)
  if (len(items)+len(errors))%20==0:print('Imported',len(items),'of',len(links),'errors',len(errors),flush=True)
order={BASE+d['url']:i for i,d in enumerate(links)};items.sort(key=lambda d:order[d['url']])
unique={p['number'] for d in items for p in d['parts'] if p['number']}
output={'vehicle':'2012 Honda Accord · 4 Door LX · KL 5AT','source':BASE+'/2012-honda-accord--4dr_lx-kl_5at-parts.html','retrieved':datetime.now(timezone.utc).isoformat(),'groupCount':len(items),'diagramCount':sum(len(d['diagrams']) for d in items),'partCount':len(unique),'groups':items,'unavailable':errors}
(ROOT/'dist/data/catalog.json').write_text(json.dumps(output,separators=(',',':')))
print(json.dumps({k:v for k,v in output.items() if k not in ('groups','unavailable')}),flush=True)
if errors:print('Unresolved pages:',len(errors),flush=True)
