import*as f from'fs'
let E=process.env,I=E.MAKEFUN_INPUT_DIR??'/input',O=E.MAKEFUN_OUTPUT_DIR??'/output',W=f.writeFileSync
for(let d of f.readdirSync(I)){let F=x=>f.readFileSync(`${I}/${d}/${x}.bin`),P=F('program'),N=F('input'),n=P.length,S=new Int32Array(999),o='',p=0,s=0,j=0,t=0,k=0,D=`${O}/${d}`,r,y;for(;;){let c=P[p],v='09Q23456        444444424442444 444             @BB@0           24              2212'.charCodeAt(c)-48,i=v>>3,a=S[s-2],b=S[s-1],A=a>>>0,B=b>>>0;r=t++>=1e6?10:c==null?9:v>=0?p+i>=n?9:s<(v>>1&3)?2:v&s>255?3:c>18&c<23&!b?4:c>>1==32&B>255?6:c==51&k>63?7:c==52&!k?8:c>>1==40&&(o+(c&1||b)).length>65536?11:c==83?b&255:-!!c:5
if(r>=0)break
p+=i+1;y=P[p-2]|P[p-1]<<8
c>15&c<35?S[(s-=v>2)-1]=[a+b,a-b,Math.imul(a,b),a/b,a%b,A/B,A%B,-b,a&b,a|b,a^b,~b,a<<b,a>>b,a>>>b,,a==b,a<b,A<B][c-16]:c>47&c<51?c>48&&!S[--s]^c&1||(p+=y<<16>>16):v&1?S[s++]=[,P[p-1]<<24>>24,P[p-4]|P[p-3]<<8|y<<16,,b,,a][c]??N[j++]??-1:c==3?s--:c==5?S.set([b,a],s-2):c==7?S.set([a,b,S[s-3]],s-3):c==51?(S[512+k++]=p,p=y):c==52?p=S[512+--k]:c==64?S[s-1]=S[256+b]:c==65?(S[256+b]=a,s-=2):(o+=c&1?String.fromCharCode(b):b,s--)}
f.mkdirSync(D,{recursive:!0})
W(D+'/stdout.bin',o,'latin1')
W(D+'/exit.txt',''+r)}
