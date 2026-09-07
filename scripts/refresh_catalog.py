"""Refresh the vehicle directory; preserve existing facts and download missing assemblies.
Source facts and diagrams are attributed in the interface. No account or purchase requests.
"""
from pathlib import Path
import json, re, urllib.request, urllib.parse, concurrent.futures
from datetime import datetime, timezone
from html.parser import HTMLParser
class AnchorParser(HTMLParser):
 def __init__(self,html):
  super().__init__();self.anchors=[];self.current=None;self.feed(html)
 def handle_starttag(self,tag,attrs):
  if tag=='a':self.current={'href':dict(attrs).get('href',''),'text':''}
 def handle_data(self,data):
  if self.current is not None:self.current['text']+=data
 def handle_endtag(self,tag):
  if tag=='a' and self.current is not None:self.anchors.append(self.current);self.current=None
ROOT=Path(__file__).resolve().parents[1]; BASE='https://www.hondapartsnow.com'
CAT=ROOT/'dist/data/catalog.json'; old=json.loads(CAT.read_text()); known={g['id']:g for g in old['groups']}
def get(u):
 with urllib.request.urlopen(u,timeout=25) as r:return r.read()
html=get(BASE+'/2012-honda-accord--4dr_lx-kl_5at-parts.html').decode(); soup=AnchorParser(html); directory={}
for a in soup.anchors:
 url=a['href']
 if '/parts-list/2012-honda-accord--4dr_lx-kl_5at/' not in url or not url.endswith('.html'):continue
 slug=url.split('/')[-2]+'--'+url.split('/')[-1][:-5]
 directory[slug]={'id':slug,'name':a['text'].strip(),'category':url.split('/')[-2],'url':urllib.parse.urljoin(BASE,url)}
def flat(x):
 for v in x:
  if isinstance(v,list):yield from flat(v)
  elif isinstance(v,dict):yield v
def run(entry):
 slug=entry['id']; group=known.get(slug)
 if not group:
  raw=get(entry['url']).decode(); match=re.search(r'<script[^>]*id="initialState"[^>]*>(.*?)</script>',raw,re.S)
  data=match.group(1).split('=',1)[1].strip().rstrip(';'); data=re.sub(r'(?<=:)undefined(?=[,}])','null',data);state=json.loads(data)['partList']
  group={**entry,'diagrams':[],'parts':[]};seen=set()
  for i,d in enumerate(state['diagramList']):
   remote=BASE+(d.get('largeImg') or d['img']); group['diagrams'].append({'id':d['id'],'name':d['name'],'image':remote,'sourceImage':remote,'hotspots':d.get('hotSpotList',[])})
  for p in flat(state['partList']):
   key=(p.get('partNumber'),p.get('code'),p.get('auxiliaryDesc'))
   if key in seen:continue
   seen.add(key);group['parts'].append({'number':p.get('partNumber'),'name':p.get('mainDesc') or p.get('pncDesc'),'ref':p.get('code',''),'url':BASE+p['url'],'images':[BASE+v for v in p.get('pictures',[])],'qualifiers':p.get('subDescList',[]),'extra':p.get('allExtraInfoList',[]),'note':p.get('auxiliaryDesc') or '', 'replacement':p.get('replace') or ''})
 for i,d in enumerate(group['diagrams']):
  dest=ROOT/'dist/assets/diagrams'/f'{slug}-{i}.png'
  if not dest.exists():
   try:dest.write_bytes(get(d['sourceImage']))
   except Exception:continue
  d['image']='./assets/diagrams/'+dest.name
 return group
errors=[];n=0
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
 futures={ex.submit(run,e):e for e in directory.values()}
 for f in concurrent.futures.as_completed(futures):
  e=futures[f]
  try:known[e['id']]=f.result()
  except Exception as err:errors.append({**e,'error':str(err)})
  n+=1
  if n%25==0:print('Processed',n,'of',len(directory),'unavailable',len(errors),flush=True)
groups=sorted(known.values(),key=lambda x:(x['category'],x['name'])); old.update(groups=groups,groupCount=len(groups),diagramCount=sum(len(g['diagrams']) for g in groups),partCount=len({p['number'] for g in groups for p in g['parts'] if p['number']}),retrieved=datetime.now(timezone.utc).isoformat(),directoryCount=len(directory),unavailable=errors)
CAT.write_text(json.dumps(old,separators=(',',':')))
(ROOT/'dist/data/catalog-directory.json').write_text(json.dumps(list(directory.values()),separators=(',',':')))
print('Catalog complete',old['groupCount'],old['diagramCount'],old['partCount'],'unavailable',len(errors),flush=True)
# Save only contextual manual index metadata; procedures stay at the linked service source.
url='https://charm.li/Honda/2012/Accord%20L4-2.4L/Repair%20and%20Diagnosis/'
try:
 manual=AnchorParser(get(url).decode());links={}
 for a in manual.anchors:
  href=urllib.parse.urljoin(url,a['href']);name=a['text'].strip()
  if not href.startswith(url) or not name or name=='Image':continue
  path=urllib.parse.unquote(href[len(url):]).strip('/');links[href]={'name':name,'path':path,'url':href}
 (ROOT/'dist/data/manuals.json').write_text(json.dumps({'source':url,'links':list(links.values())},separators=(',',':')))
 print('Contextual service guide links',len(links),flush=True)
except Exception as err:print('Manual index unavailable',str(err),flush=True)
