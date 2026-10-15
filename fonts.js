// Adobe Fonts kit supplied by the project owner.
(function (d) {
  var config = {
    kitId: 'xde7urj',
    scriptTimeout: 8000,
    async: true,
    active: function () {
      // Wait for the exact UI weights before exposing the composition. This
      // prevents the initial fallback-font measurement from resizing glyphs.
      Promise.all([
        document.fonts.load('400 16px omnigothic'),
        document.fonts.load('600 16px omnigothic'),
        document.fonts.ready
      ]).finally(function () {
        document.documentElement.classList.remove('bang-fonts-pending');
        window.dispatchEvent(new Event('bang-fonts-ready'));
      });
    }
  };
  var h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,'')+' wf-inactive';h.classList.remove('bang-fonts-pending');},config.scriptTimeout),tk=d.createElement('script'),f=false,s=d.getElementsByTagName('script')[0],a;
  h.className+=' wf-loading';
  tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;
  tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!=='complete'&&a!=='loaded')return;f=true;clearTimeout(t);try{Typekit.load(config);}catch(e){}};
  s.parentNode.insertBefore(tk,s);
})(document);
