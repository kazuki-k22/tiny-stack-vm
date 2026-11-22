import*as f from'fs'
let E=process.env,I=E.MAKEFUN_INPUT_DIR??'/input',O=E.MAKEFUN_OUTPUT_DIR??'/output'
for(let d of f.readdirSync(I)){let F=x=>f.readFileSync(`${I}/${d}/${x}.bin`),P=F('program'),N=F('input'),S=new Int32Array(256),M=new Int32Array(256),C=[],o='',p=0,s=0,j=0,t=0,D=`${O}/${d}`,z=(()=>{for(;;){if(t++==1e6)return 10
if(p>>>0>=P.length)return 9
let c=P[p],v='09Q23456        444444424442444 444             @BB@0           24              2212'.charCodeAt(c)-48,i=v>>3,a=S[s-2],b=S[s-1],y
if(!(v>=0))return 5
if(p+i>=P.length)return 9
if(s<(v>>1&3))return 2
if(v&1&&s>255)return 3
p+=i+1;y=P[p-2]|P[p-1]<<8
if(c>15&&c<35){if(c>18&&c<23&&!b)return 4;S[(s-=v>2)-1]=[a+b,a-b,Math.imul(a,b),a/b,a%b,(a>>>0)/(b>>>0),(a>>>0)%(b>>>0),-b,a&b,a|b,a^b,~b,a<<b,a>>b,a>>>b,,a==b,a<b,a>>>0<b>>>0][c-16];continue}
switch(c){case 0:return 0
case 1:S[s++]=P[p-1]<<24>>24;break
case 2:S[s++]=P[p-4]|P[p-3]<<8|y<<16;break
case 3:s--;break
case 4:S[s++]=b;break
case 5:S[s-2]=b;S[s-1]=a;break
case 6:S[s++]=a;break
case 7:S[s-1]=S[s-3];S[s-3]=a;S[s-2]=b;break
case 48:p+=y<<16>>16;break
case 49:S[--s]||(p+=y<<16>>16);break
case 50:S[--s]&&(p+=y<<16>>16);break
case 51:if(C.length>63)return 7;C.push(p);p=y;break
case 52:if(!C.length)return 8;p=C.pop();break
case 64:if(b>>>0>255)return 6;S[s-1]=M[b];break
case 65:if(b>>>0>255)return 6;M[b]=a;s-=2;break
case 80:if((o+b).length>65536)return 11;o+=b;s--;break
case 81:if(o.length>65535)return 11;o+=String.fromCharCode(b&255);s--;break
case 82:S[s++]=N[j++]??-1;break
case 83:return b&255}}})()
f.mkdirSync(D,{recursive:!0})
f.writeFileSync(D+'/stdout.bin',Buffer.from(o,'latin1'))
f.writeFileSync(D+'/exit.txt',''+z)}
