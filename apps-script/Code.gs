/**
 * SURVEY PJU - BACKEND GOOGLE APPS SCRIPT
 * Database: Google Spreadsheet PJU_Survey
 * GPS: satu kolom "Lokasi GPS" (format LatLong AppSheet: -8.123,118.456)
 */

const CONFIG = {
  SPREADSHEET_ID: '1IhB-agDYb7WcVSnZioHRWYE9Hm2iQLsJdA72E9jlXWY',
  DATA_SHEET: 'PJU_Survey', ULP_SHEET: 'ULP', USERS_SHEET: 'Users',
  REF_SHEET: 'Referensi', DASHBOARD_SHEET: 'Dashboard'
};

const HEADERS = [
  'ID Survey','Timestamp','Email Petugas','Nama Petugas','ULP','Wilayah',
  'Status Legalitas','IDPEL','Kabupaten/Kota','Kecamatan','Desa/Kelurahan','Alamat',
  'Lokasi GPS','Nomor Tiang','Jenis Tiang','Kondisi Tiang','Jenis Lampu','Daya (W)',
  'Lampu Menyala','Kondisi Lampu','Kondisi Panel/Meter','Kondisi Jaringan','Perlu Tindakan',
  'Prioritas','Foto PJU','Foto Meter','Foto Lokasi','Catatan','Status Tindak Lanjut',
  'Tanggal Tindak Lanjut','Catatan Tindak Lanjut'
];

function ss_(){return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);}

function setupPJU(){
  const ss=ss_();
  migrateCoordinateToLatLong_();
  ensureSheet_(ss,CONFIG.DATA_SHEET,HEADERS);
  ensureSheet_(ss,CONFIG.ULP_SHEET,['ULP','Wilayah Kerja','Keterangan']);
  ensureSheet_(ss,CONFIG.USERS_SHEET,['Email','Nama','ULP','Role','Aktif']);
  ensureSheet_(ss,CONFIG.REF_SHEET,['Kategori','Nilai','Aktif']);
  ensureSheet_(ss,CONFIG.DASHBOARD_SHEET,['KPI','Nilai']);
  seedULP_(ss);seedRef_(ss);formatData_(ss.getSheetByName(CONFIG.DATA_SHEET));refreshDashboard();
  return 'Setup Survey PJU selesai. GPS sudah menjadi satu kolom Lokasi GPS.';
}

/** Jalankan sekali setelah memasang versi ini di Apps Script.
 * Menggabungkan Latitude + Longitude menjadi satu kolom Lokasi GPS dan menghapus kolom Longitude lama.
 */
function migrateCoordinateToLatLong(){
  const msg=migrateCoordinateToLatLong_();
  refreshDashboard();
  return msg;
}

function migrateCoordinateToLatLong_(){
  const ss=ss_(),sh=ss.getSheetByName(CONFIG.DATA_SHEET);
  if(!sh)return 'Sheet PJU_Survey belum ada.';
  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];
  const norm=s=>String(s||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_');
  let gps=headers.findIndex(h=>['lokasi gps','lokasi_gps','gps','latlong','lat long'].includes(norm(h)));
  const lat=headers.findIndex(h=>['latitude','lat'].includes(norm(h)));
  const lon=headers.findIndex(h=>['longitude','long','lng','lon'].includes(norm(h)));
  if(gps>=0){sh.getRange(1,gps+1).setValue('Lokasi GPS');return 'Kolom Lokasi GPS sudah tersedia.';}
  if(lat<0||lon<0)return 'Latitude/Longitude tidak ditemukan; tidak ada perubahan.';
  const lastRow=sh.getLastRow();
  if(lastRow>=2){
    const data=sh.getRange(2,1,lastRow-1,sh.getLastColumn()).getDisplayValues();
    const out=data.map(r=>{const a=String(r[lat]||'').trim(),b=String(r[lon]||'').trim();return[a&&b?a+','+b:''];});
    sh.getRange(2,lat+1,lastRow-1,1).setValues(out);
  }
  sh.getRange(1,lat+1).setValue('Lokasi GPS');
  sh.deleteColumn(lon+1);
  return 'Latitude dan Longitude berhasil digabung menjadi Lokasi GPS.';
}

function ensureSheet_(ss,name,headers){
  let sh=ss.getSheetByName(name); if(!sh)sh=ss.insertSheet(name);
  if(sh.getLastRow()===0||sh.getRange(1,1).getDisplayValue()===''){
    sh.getRange(1,1,1,headers.length).setValues([headers]);sh.setFrozenRows(1);
  }
  return sh;
}

function seedULP_(ss){
  const sh=ss.getSheetByName(CONFIG.ULP_SHEET); if(sh.getLastRow()>1)return;
  sh.getRange(2,1,4,3).setValues([
    ['ULP Sape','Kabupaten Bima','Wilayah kerja ULP Sape'],
    ['ULP Dompu','Kabupaten Dompu','Wilayah kerja ULP Dompu'],
    ['ULP Woha','Kabupaten Bima','Wilayah kerja ULP Woha'],
    ['ULP Bikot','Kota Bima','Wilayah kerja Kota Bima']
  ]);
}
function seedRef_(ss){
  const sh=ss.getSheetByName(CONFIG.REF_SHEET); if(sh.getLastRow()>1)return;
  const rows=[
    ['Status Legalitas','LEGAL',true],['Status Legalitas','ILEGAL',true],
    ['Wilayah','Kabupaten Bima',true],['Wilayah','Kabupaten Dompu',true],['Wilayah','Kota Bima',true],
    ['Kondisi Tiang','Baik',true],['Kondisi Tiang','Rusak Ringan',true],['Kondisi Tiang','Rusak Berat',true],['Kondisi Tiang','Hilang',true],['Kondisi Tiang','Perlu Pemeriksaan',true],
    ['Jenis Lampu','LED',true],['Jenis Lampu','HPL',true],['Jenis Lampu','SON',true],['Jenis Lampu','Lainnya',true],
    ['Lampu Menyala','Menyala',true],['Lampu Menyala','Mati',true],['Lampu Menyala','Redup',true],
    ['Kondisi Lampu','Baik',true],['Kondisi Lampu','Rusak',true],['Kondisi Panel/Meter','Baik',true],['Kondisi Panel/Meter','Rusak',true],
    ['Kondisi Jaringan','Baik',true],['Kondisi Jaringan','Rusak',true],['Perlu Tindakan','Ya',true],['Perlu Tindakan','Tidak',true],
    ['Prioritas','Rendah',true],['Prioritas','Sedang',true],['Prioritas','Tinggi',true],['Prioritas','Darurat',true],
    ['Status Tindak Lanjut','Belum Ditindaklanjuti',true],['Status Tindak Lanjut','Dalam Proses',true],['Status Tindak Lanjut','Selesai',true]
  ]; sh.getRange(2,1,rows.length,3).setValues(rows);
}
function formatData_(sh){
  sh.setFrozenRows(1); if(sh.getFilter())sh.getFilter().remove();
  sh.getRange(1,1,Math.max(sh.getLastRow(),1),Math.min(sh.getLastColumn(),HEADERS.length)).createFilter();
  sh.getRange(1,1,1,Math.min(sh.getLastColumn(),HEADERS.length)).setFontWeight('bold');
}
function refreshDashboard(){
  const ss=ss_(),sh=ss.getSheetByName(CONFIG.DASHBOARD_SHEET); sh.clear();
  sh.getRange('A1').setValue('DASHBOARD SURVEY PJU - BIMA / DOMPU / KOTA BIMA').setFontWeight('bold').setFontSize(16);
  sh.getRange('A3:B14').setValues([
    ['Total Survey','=COUNTA(PJU_Survey!A2:A)'],['ULP Sape','=COUNTIF(PJU_Survey!E2:E,"ULP Sape")'],['ULP Dompu','=COUNTIF(PJU_Survey!E2:E,"ULP Dompu")'],['ULP Woha','=COUNTIF(PJU_Survey!E2:E,"ULP Woha")'],['ULP Bikot','=COUNTIF(PJU_Survey!E2:E,"ULP Bikot")'],
    ['LEGAL','=COUNTIF(PJU_Survey!G2:G,"LEGAL")'],['ILEGAL','=COUNTIF(PJU_Survey!G2:G,"ILEGAL")'],['Legal Tanpa IDPEL','=COUNTIFS(PJU_Survey!G2:G,"LEGAL",PJU_Survey!H2:H,"")'],
    ['Perlu Tindakan','=COUNTIF(PJU_Survey!W2:W,"Ya")'],['Lampu Mati','=COUNTIF(PJU_Survey!S2:S,"Mati")'],['Prioritas Tinggi/Darurat','=COUNTIF(PJU_Survey!X2:X,"Tinggi")+COUNTIF(PJU_Survey!X2:X,"Darurat")'],['Data Wilayah','=COUNTA(PJU_Survey!I2:I)']
  ]); sh.getRange('A3:A14').setFontWeight('bold'); sh.autoResizeColumns(1,2);
}

function appendSurvey_(data){
  const sh=ss_().getSheetByName(CONFIG.DATA_SHEET); if(!sh)throw new Error('Sheet PJU_Survey belum ada. Jalankan setupPJU().');
  const legalitas=String(data['Status Legalitas']||'').trim().toUpperCase(),idpel=String(data['IDPEL']||'').trim();
  if(!['LEGAL','ILEGAL'].includes(legalitas))throw new Error('Status Legalitas harus LEGAL atau ILEGAL.');
  if(legalitas==='LEGAL'&&!idpel)throw new Error('IDPEL wajib diisi untuk status LEGAL.');
  if(legalitas==='ILEGAL'&&idpel)throw new Error('IDPEL harus kosong untuk status ILEGAL.');
  const gps=data['Lokasi GPS']||data['LATLONG']||'';
  const id=data['ID Survey']||('PJU-'+Utilities.getUuid().slice(0,8).toUpperCase()),timestamp=data['Timestamp']||new Date();
  const row=HEADERS.map(h=>h==='ID Survey'?id:h==='Timestamp'?timestamp:h==='Status Legalitas'?legalitas:h==='IDPEL'?idpel:h==='Lokasi GPS'?gps:(data[h]??''));
  sh.appendRow(row); return {ok:true,id,row:sh.getLastRow(),statusLegalitas:legalitas,idpel,location:gps};
}
function getData_(){
  const sh=ss_().getSheetByName(CONFIG.DATA_SHEET); if(!sh||sh.getLastRow()<2)return [];
  const values=sh.getRange(1,1,sh.getLastRow(),Math.min(sh.getLastColumn(),HEADERS.length)).getDisplayValues(),headers=values.shift();
  return values.map(row=>{const o={};headers.forEach((h,i)=>o[h]=row[i]||'');return o;}).filter(r=>Object.values(r).some(v=>v!==''));
}
function getStats_(){
  const rows=getData_(),byUlp={'ULP Sape':0,'ULP Dompu':0,'ULP Woha':0,'ULP Bikot':0},byWilayah={'Kabupaten Bima':0,'Kabupaten Dompu':0,'Kota Bima':0},byLegalitas={LEGAL:0,ILEGAL:0};
  let perluTindakan=0,lampuMati=0,prioritasTinggi=0,legalTanpaIdpel=0;
  rows.forEach(r=>{if(Object.prototype.hasOwnProperty.call(byUlp,r.ULP))byUlp[r.ULP]++;if(Object.prototype.hasOwnProperty.call(byWilayah,r['Kabupaten/Kota']))byWilayah[r['Kabupaten/Kota']]++;const l=String(r['Status Legalitas']||'').toUpperCase();if(Object.prototype.hasOwnProperty.call(byLegalitas,l))byLegalitas[l]++;if(l==='LEGAL'&&!String(r.IDPEL||'').trim())legalTanpaIdpel++;if(String(r['Perlu Tindakan']).toLowerCase()==='ya')perluTindakan++;if(String(r['Lampu Menyala']).toLowerCase()==='mati')lampuMati++;if(['tinggi','darurat'].includes(String(r.Prioritas||'').toLowerCase()))prioritasTinggi++;});
  return {total:rows.length,byUlp,byWilayah,byLegalitas,legalTanpaIdpel,perluTindakan,lampuMati,prioritasTinggi};
}
function doGet(e){const action=(e&&e.parameter&&e.parameter.action)||'data';try{if(action==='health')return json_({ok:true,service:'Survey PJU API',time:new Date().toISOString()});if(action==='stats')return json_({ok:true,stats:getStats_()});if(action==='config')return json_({ok:true,ulp:['ULP Sape','ULP Dompu','ULP Woha','ULP Bikot'],wilayah:['Kabupaten Bima','Kabupaten Dompu','Kota Bima'],legalitas:['LEGAL','ILEGAL']});if(action==='data')return json_({ok:true,rows:getData_()});return json_({ok:false,error:'Action tidak dikenal'});}catch(err){return json_({ok:false,error:String(err)});}}
function doPost(e){try{const body=e&&e.postData&&e.postData.contents?JSON.parse(e.postData.contents):{};if((body.action||'append')==='append')return json_({ok:true,result:appendSurvey_(body.data||body)});return json_({ok:false,error:'Action POST tidak dikenal'});}catch(err){return json_({ok:false,error:String(err)});}}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
function onOpen(){SpreadsheetApp.getUi().createMenu('Survey PJU').addItem('Migrasi GPS → Lokasi GPS','migrateCoordinateToLatLong').addItem('Setup / Perbaiki Struktur','setupPJU').addItem('Refresh Dashboard','refreshDashboard').addToUi();}
