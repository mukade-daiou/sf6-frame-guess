import test from 'node:test';
import assert from 'node:assert/strict';
import { convert } from '../scripts/collect-supercombo.mjs';

const src={url:'https://wiki.supercombo.gg/w/Street_Fighter_6/Ryu/Frame_data', fetchedAt:'2026-08-19T04:05:28.570Z'};
const row=(category, input, name, st=4, tot=20, hit=2, block=-3)=>({
  category,input:{numpad:input},name:{en:name},startup:st,totalFrames:tot,
  onHit:hit,onBlock:block,source:src});
test('regular move is preferred over confirmed Denjin variant',()=>{
  const obj={id:'ryu',source:src,moves:[row('special','236HP','Hadoken',12,47,-2,-9),row('special','236HP','Denjin Charge Hadoken',12,40,54,-1)]};
  const result=convert(obj);
  assert.equal(result.character.moves.length,1);
  assert.equal(result.character.moves[0].name,'Hadoken');
  assert.equal(result.audit.excluded.length,1);
  assert.equal(result.character.moves[0].frames.total.provenance,'source');
  assert.equal(result.character.coverage.special.status,'partial');
});
test('unresolved same-input collision is excluded',()=>{
  const obj={id:'ryu',source:src,moves:[row('special','236LP','Foo'),row('special','236LP','Bar')]};
  assert.equal(convert(obj).character.moves.length,0);
  assert.equal(convert(obj).audit.excluded.length,2);
});
test('base normal, OD, charge and none inputs',()=>{
  const obj={id:'ryu',source:src,moves:[
    row('normal','5LP','Standing Light Punch'),
    row('special','214PP','OD Hashogeki'),
    row('special','[4]6LP','Charging Attack'),
    row('special','22P','Denjin Charge',50,52,null,null),
    row('special','j.214K','Aerial'),
  ]};
  const a=convert(obj);assert.equal(a.character.moves.length,4);
  assert.equal(a.character.moves.find(m=>m.name==='Denjin Charge').input.strength,'none');
  assert.equal(a.character.moves.find(m=>m.name==='Denjin Charge').frames.hit.status,'unknown');
  assert.equal(a.audit.missingNormals.length,11);
  assert.equal(a.character.moves.find(m=>m.name==='OD Hashogeki').input.strength,'OD');
});
test('source version is not fabricated',()=>{
  const result=convert({id:'ryu',source:src,moves:[row('normal','5LP','Standing Light Punch')]});
  assert.equal(result.character.gameVersion,'UNVERIFIED');
  assert.equal(result.character.source.verification,'unverified');
});
