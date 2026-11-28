import {seededRandom} from '../playground/grid.js';

export const aliases=['Комета','Искра','Листик','Север','Винтик','Луч'];
export const colors=['Слива','Мята','Янтарь','Лаванда'];
export const headwear=['Убор с пером','Диадема','Круглые очки'];

export function readAvatar(raw) {
  if (!Number.isInteger(raw?.name)||!Number.isInteger(raw.color)||!Number.isInteger(raw.hat)||
      !aliases[raw.name]||!colors[raw.color]||!headwear[raw.hat]||!['reader','engineer'].includes(raw.role)) return null;
  return {name:raw.name,color:raw.color,hat:raw.hat,role:raw.role};
}

export function generateAvatar(seed) {
  const pick=seededRandom(seed);
  return {name:pick(aliases.length),color:pick(colors.length),hat:pick(headwear.length),role:pick(2)?'engineer':'reader'};
}

const face=[
  '0000000000000000','0000000000000000','0000011111100000','0001122222211000',
  '0012244444422100','0012444444442100','0014454545444100','0014454545444100',
  '0001444444441000','0001444554441000','0000144444410000','0000114444110000',
  '0001661111661000','0016666116666100','0013666616663100','0001111111110000'
];
const hats=[
  ['0000000011000000','0000111161100000','0001266662610000','0001111111110000'],
  ['0000100100100000','0001661616610000','0001666666610000','0001111111110000'],
  []
];

export function avatarPixels(avatar) {
  const rows=[...face];
  for (const [i,row] of hats[avatar.hat].entries()) rows[i]=row;
  if (avatar.hat===2) {
    rows[6]='0014111411144100';
    rows[7]='0014171417144100';
    rows[8]='0001114441111000';
  }
  return avatar.color+':'+rows.join('');
}
