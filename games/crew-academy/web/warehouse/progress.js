import {collectPrize} from '../expedition/rooms.js';
import {changeShift,jobs,matched,readShift} from './rules.js';

export function expressOpen(profile) {
  return Boolean(profile.warehouseReports?.line || profile.warehouse?.shifts?.line?.board?.sent);
}
export function activeJob(profile) {
  return profile.warehouse?.active==='express'&&expressOpen(profile)?'express':'line';
}
export function warehouseRoute(profile) {
  let id=activeJob(profile);
  let run=readShift(profile.warehouse,id);
  const next=id==='line'&&run.board.sent&&!profile.warehouseReports?.express;
  if(next){id='express';run=readShift(profile.warehouse,id);}
  const job=jobs[id];
  return {kind:'warehouse',title:'Склад Робота',place:job.name,href:'./expedition.html#cargo'+(next?'/express':''),
    action:next?'Открыть экспресс-сортировку':profile.warehouse?'Продолжить погрузку':'Начать погрузку',art:'./warehouse/'+job.art+'.webp',
    detail:job.name+' · плиты '+matched(job,run.board)+' / 2',
    text:id==='line'?'Проведи два груза между стеллажами. Поставь энергоячейку и хладагент на свои плиты.':
      'Переведи стрелку на нужный приёмник и толкни ящик на ленту.'};
}

export function applyWarehouse(profile,id,action,at) {
  if(!Object.hasOwn(jobs,id)||id==='express'&&!expressOpen(profile))return null;
  const warehouse=profile.warehouse || {active:'line',shifts:{}};
  if(action.type==='open'){
    if(profile.warehouse && warehouse.active===id)return null;
    profile.warehouse={...warehouse,active:id};return {opened:true};
  }
  if(activeJob(profile)!==id)return null;
  const previous=readShift(warehouse,id),result=changeShift(id,previous,action);
  if(result.run===previous)return result;
  profile.warehouse={...warehouse,active:id,shifts:{...warehouse.shifts,[id]:result.run}};
  if(result.shipped){
    const b=result.run.board,older=profile.warehouseReports?.[id];
    const report={id,at,shipment:(older?.shipment||0)+1,moves:b.moves,pushes:b.pushes,rides:b.rides,
      switches:b.switches,returns:result.run.returns,receivedAt:null};
    profile.warehouseReports={...profile.warehouseReports,[id]:report};
    const prize=id==='line'?'cargo':'cargo-express';
    return {...result,report,prize,fresh:collectPrize(profile,prize)};
  }
  return result;
}

export function acceptShipment(profile,shipment,at) {
  const report=profile.warehouseReports?.express;
  if(!report||report.shipment!==shipment||report.receivedAt!=null)return false;
  profile.warehouseReports={...profile.warehouseReports,express:{...report,receivedAt:at}};
  return true;
}
