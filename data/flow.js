// Confirmed video: 16 -> 19 -> 20 -> 21 -> 22.
// Other common lessons follow the actual sentence continuity in the supplied PNGs.
(() => {
  const sequence=[15,18,16,19,20,21,22,23,24,27,31,33,34,35,42,37,38,39,43,44,45,46,47,137];
  const next=Object.fromEntries(sequence.slice(0,-1).map((id,i)=>[id,sequence[i+1]]));
  Object.assign(next,{17:19,132:82,49:82,82:93,93:131,131:53,53:57,57:62,62:75,75:70,70:79,79:85,85:89,89:94,94:97,97:101,107:114,120:123,123:125,128:130,142:138});
  window.BANG_FLOW={next,choices:{101:107,114:120},roleScreens:[133,134,135,136],roleNames:['보안관','부관','무법자','배신자']};
})();
