/**
 *  Messenger Translator
 *  Copyright (C) 2020 Adriane Justine Tan
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 *  Supported languages by Google Translate.
 */
module.exports = {
  af: { name: 'Afrikaans', regex: /^(af|Afrikaans)$/i },
  sq: { name: 'Albanian', regex: /^(sq|Albanian)$/i },
  am: { name: 'Amharic', regex: /^(am|Amharic)$/i },
  ar: { name: 'Arabic', regex: /^(ar|Arab(ic)?)$/i },
  hy: { name: 'Armenian', regex: /^(hy|Armenian)$/i },
  az: { name: 'Azerbaijani', regex: /^(az|Azerbaijani)$/i },
  eu: { name: 'Basque', regex: /^(eu|Basque)$/i },
  be: { name: 'Belarusian', regex: /^(be|Belarusian)$/i },
  bn: { name: 'Bengali', regex: /^(bn|Bengali)$/i },
  bs: { name: 'Bosnian', regex: /^(bs|Bosnian)$/i },
  bg: { name: 'Bulgarian', regex: /^(bg|Bulgarian)$/i },
  ca: { name: 'Catalan', regex: /^(ca|Catalan)$/i },
  ceb: { name: 'Cebuano', regex: /^(ceb|Cebuano)$/i },
  ny: { name: 'Chichewa', regex: /^(ny|Chichewa)$/i },
  zh: { name: 'Chinese Simplified', regex: /^(zh|Chinese( Simplified)?)$/i },
  'zh-CN': {
    name: 'Chinese Simplified', regex: /^(zh-cn|Chinese Simplified)$/i
  },
  'zh-TW': {
    name: 'Chinese Traditional', regex: /^(zh-tw|Chinese Traditional)$/i
  },
  co: { name: 'Corsican', regex: /^(co|Corsican)$/i },
  hr: { name: 'Croatian', regex: /^(hr|Croatian)$/i },
  cs: { name: 'Czech', regex: /^(cs|Czech)$/i },
  da: { name: 'Danish', regex: /^(da|Danish)$/i },
  nl: { name: 'Dutch', regex: /^(nl|Dutch)$/i },
  en: { name: 'English', regex: /^(en|English)$/i },
  eo: { name: 'Esperanto', regex: /^(eo|Esperanto)$/i },
  et: { name: 'Estonian', regex: /^(et|Estonian)$/i },
  fi: { name: 'Finnish', regex: /^(fi|Finnish)$/i },
  fr: { name: 'French', regex: /^(fr|French)$/i },
  fy: { name: 'Frisian', regex: /^(fy|Frisian)$/i },
  gl: { name: 'Galician', regex: /^(gl|Galician)$/i },
  ka: { name: 'Georgian', regex: /^(ka|Georgian)$/i },
  de: { name: 'German', regex: /^(de|German)$/i },
  el: { name: 'Greek', regex: /^(el|Greek)$/i },
  gu: { name: 'Gujarati', regex: /^(gu|Gujarati)$/i },
  ht: { name: 'Haitian Creole', regex: /^(ht|Haitian Creole)$/i },
  ha: { name: 'Hausa', regex: /^(ha|Hausa)$/i },
  haw: { name: 'Hawaiian', regex: /^(haw|Hawaiian)$/i },
  he: { name: 'Hebrew', regex: /^(he|Hebrew)$/i },
  iw: { name: 'Hebrew', regex: /^(iw|Hebrew)$/i },
  hi: { name: 'Hindi', regex: /^(hi|Hindi)$/i },
  hmn: { name: 'Hmong', regex: /^(hmn|Hmong)$/i },
  hu: { name: 'Hungarian', regex: /^(hu|Hungarian)$/i },
  is: { name: 'Icelandic', regex: /^(is|Icelandic)$/i },
  ig: { name: 'Igbo', regex: /^(ig|Igbo)$/i },
  id: { name: 'Indonesian', regex: /^(id|Indonesian)$/i },
  ga: { name: 'Irish', regex: /^(ga|Irish)$/i },
  it: { name: 'Italian', regex: /^(it|Italian)$/i },
  ja: { name: 'Japanese', regex: /^(ja|Japanese)$/i },
  jw: { name: 'Javanese', regex: /^(jw|Javanese)$/i },
  kn: { name: 'Kannada', regex: /^(kn|Kannada)$/i },
  kk: { name: 'Kazakh', regex: /^(kk|Kazakh)$/i },
  km: { name: 'Khmer', regex: /^(km|Khmer)$/i },
  ko: { name: 'Korean', regex: /^(ko|Korean)$/i },
  ku: {
    name: 'Kurdish (Kurmanji)',
    regex: /^(ku|Kurdish \(Kurmanji\)|Kurdish|Kurmanji)$/i
  },
  ky: { name: 'Kyrgyz', regex: /^(ky|Kyrgyz)$/i },
  lo: { name: 'Lao', regex: /^(lo|Lao)$/i },
  la: { name: 'Latin', regex: /^(la|Latin)$/i },
  lv: { name: 'Latvian', regex: /^(lv|Latvian)$/i },
  lt: { name: 'Lithuanian', regex: /^(lt|Lithuanian)$/i },
  lb: { name: 'Luxembourgish', regex: /^(lb|Luxembourgish)$/i },
  mk: { name: 'Macedonian', regex: /^(mk|Macedonian)$/i },
  mg: { name: 'Malagasy', regex: /^(mg|Malagasy)$/i },
  ms: { name: 'Malay', regex: /^(ms|Malay)$/i },
  ml: { name: 'Malayalam', regex: /^(ml|Malayalam)$/i },
  mt: { name: 'Maltese', regex: /^(mt|Maltese)$/i },
  mi: { name: 'Maori', regex: /^(mi|Maori)$/i },
  mr: { name: 'Marathi', regex: /^(mr|Marathi)$/i },
  mn: { name: 'Mongolian', regex: /^(mn|Mongolian)$/i },
  my: {
    name: 'Myanmar (Burmese)',
    regex: /^(my|Myanmar \(Burmese\)|Myanmar|Burmese)$/i
  },
  ne: { name: 'Nepali', regex: /^(ne|Nepali)$/i },
  no: { name: 'Norwegian', regex: /^(no|Norwegian)$/i },
  ps: { name: 'Pashto', regex: /^(ps|Pashto)$/i },
  fa: { name: 'Persian', regex: /^(fa|Persian)$/i },
  pl: { name: 'Polish', regex: /^(pl|Polish)$/i },
  pt: { name: 'Portuguese', regex: /^(pt|Portuguese)$/i },
  pa: { name: 'Punjabi', regex: /^(pa|Punjabi)$/i },
  ro: { name: 'Romanian', regex: /^(ro|Romanian)$/i },
  ru: { name: 'Russian', regex: /^(ru|Russian)$/i },
  sm: { name: 'Samoan', regex: /^(sm|Samoan)$/i },
  gd: { name: 'Scots Gaelic', regex: /^(gd|Scots Gaelic)$/i },
  sr: { name: 'Serbian', regex: /^(sr|Serbian)$/i },
  st: { name: 'Sesotho', regex: /^(st|Sesotho)$/i },
  sn: { name: 'Shona', regex: /^(sn|Shona)$/i },
  sd: { name: 'Sindhi', regex: /^(sd|Sindhi)$/i },
  si: { name: 'Sinhala', regex: /^(si|Sinhala)$/i },
  sk: { name: 'Slovak', regex: /^(sk|Slovak)$/i },
  sl: { name: 'Slovenian', regex: /^(sl|Slovenian)$/i },
  so: { name: 'Somali', regex: /^(so|Somali)$/i },
  es: { name: 'Spanish', regex: /^(es|Spanish)$/i },
  su: { name: 'Sundanese', regex: /^(su|Sundanese)$/i },
  sw: { name: 'Swahili', regex: /^(sw|Swahili)$/i },
  sv: { name: 'Swedish', regex: /^(sv|Swedish)$/i },
  tl: { name: 'Tagalog', regex: /^(tl|Filipino|Tagalog)$/i },
  tg: { name: 'Tajik', regex: /^(tg|Tajik)$/i },
  ta: { name: 'Tamil', regex: /^(ta|Tamil)$/i },
  te: { name: 'Telugu', regex: /^(te|Telugu)$/i },
  th: { name: 'Thai', regex: /^(th|Thai)$/i },
  tr: { name: 'Turkish', regex: /^(tr|Turkish)$/i },
  uk: { name: 'Ukrainian', regex: /^(uk|Ukrainian)$/i },
  ur: { name: 'Urdu', regex: /^(ur|Urdu)$/i },
  uz: { name: 'Uzbek', regex: /^(uz|Uzbek)$/i },
  vi: { name: 'Vietnamese', regex: /^(vi|Vietnamese)$/i },
  cy: { name: 'Welsh', regex: /^(cy|Welsh)$/i },
  xh: { name: 'Xhosa', regex: /^(xh|Xhosa)$/i },
  yi: { name: 'Yiddish', regex: /^(yi|Yiddish)$/i },
  yo: { name: 'Yoruba', regex: /^(yo|Yoruba)$/i },
  zu: { name: 'Zulu', regex: /^(zu|Zulu)$/i }
}
