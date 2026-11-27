// The two halves share their pivot points with the walkable span in the dock layout.
export function drawDockBridge(c,route,floor,progress,signal,runner){
 const [left,right]=route.gap,deck=floor,length=(right-left)/2;
 c.save();
 const well=c.createLinearGradient(0,deck,0,floor+84);
 well.addColorStop(0,'#292335');well.addColorStop(1,'#51435c');
 c.fillStyle=well;c.fillRect(left,floor,right-left,85);
 // Cable trays and lit service windows recede into the shaft below the lift.
 c.save();c.beginPath();c.rect(left,floor,right-left,86);c.clip();
 for(let layer=0;layer<2;layer++){
   const beam=layer?'#514653':'#393440',stride=layer?51:36,top=floor+(layer?37:12);
   c.fillStyle=beam;c.fillRect(left,top,right-left,4);
   for(let x=left-12;x<right;x+=stride){
     c.fillRect(x,top,4,48);c.strokeStyle=beam;c.lineWidth=3;
     c.beginPath();c.moveTo(x+2,top+38);c.lineTo(x+stride,top+3);c.stroke();
     c.fillStyle=layer?'#997f6f':'#766c79';c.fillRect(x+9,top+8,5,2);c.fillStyle=beam;
   }
 }
 c.strokeStyle='#292535';c.lineWidth=2;
 c.beginPath();c.moveTo(left,floor+8);c.quadraticCurveTo((left+right)/2,floor+59,right,floor+12);c.stroke();
 c.restore();
 for(const [edge,dir] of [[left,1],[right,-1]]){
   c.fillStyle='#423849';c.fillRect(edge-6,deck+1,12,64);
   c.fillStyle='#887a81';c.fillRect(edge-6,deck+1,3,64);
   c.save();c.translate(edge,deck);c.scale(dir,1);c.rotate(-(1-progress)*1.04);
   c.fillStyle='#292432';c.fillRect(0,-2,length,13);
   c.fillStyle='#c4aca0';c.fillRect(0,0,length,3);
   for(let i=2;i<length-4;i+=12){
     c.fillStyle='#857581';c.fillRect(i,3,9,5);
     c.fillStyle=progress>=1?'#a1eccc':'#e9b879';c.fillRect(i,2,6,2);
   }
   c.restore();
   c.fillStyle='#241e2c';c.fillRect(edge-8,deck-6,16,12);
   c.fillStyle=progress>=1?'#92e8c1':'#ffd08b';c.fillRect(edge-4,deck-3,8,6);
 }
 if(progress>=1){const mid=(left+right)/2;c.fillStyle='#30413e';c.fillRect(mid-8,deck-3,16,9);c.fillStyle='#c1ffe6';c.fillRect(mid-5,deck-2,10,3);}
 if(signal>0){
   const rx=left-22,ry=deck-42;
   c.strokeStyle='rgba(158,244,221,'+signal*.75+')';c.lineWidth=2;c.setLineDash([5,6]);
   c.beginPath();c.moveTo(runner.x,runner.y-47);c.quadraticCurveTo((runner.x+rx)/2,Math.min(runner.y-88,ry-30),rx,ry);c.stroke();c.setLineDash([]);
   for(let i=0;i<6;i++){const angle=i*Math.PI/3;const reach=8+12*(1-signal);c.fillStyle='#ffe9b6';c.fillRect(rx+Math.cos(angle)*reach,ry+Math.sin(angle)*reach,3,3);}
 }
 c.restore();
}
