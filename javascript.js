document.querySelector('.btn-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.recenze-track');
  const prevBtn = document.querySelector('.rec-prev');
  const nextBtn = document.querySelector('.rec-next');

  // původní položky (před clonováním)
  const originalItems = Array.from(track.children);
  const originalCount = originalItems.length;

  // kolik položek klonovat (doporučuju = počet, které jsou "viditelné" + 1)
  // uprav podle toho, kolik chceš najednou vidět (třeba 3)
  const visible = 3;

  // pokud máš méně položek než visible, nastav visible = originalCount
  const cloneCount = Math.min(visible, originalCount);

  // vytvoření clonů
  const beforeClones = originalItems.slice(-cloneCount).map(n => n.cloneNode(true));
  const afterClones  = originalItems.slice(0, cloneCount).map(n => n.cloneNode(true));

  beforeClones.forEach(c => track.insertBefore(c, track.firstChild));
  afterClones.forEach(c => track.appendChild(c));

  // nyní máme v tracku: [clonesBefore][originals][clonesAfter]
  let allItems = Array.from(track.children);

  // nastavení počátečního indexu (začneme u prvního originálního prvku)
  let index = cloneCount;

  // spočítáme šířku položky + margin-right
  function calcItemWidth() {
    const item = allItems[0];
    const style = getComputedStyle(item);
    const marginRight = parseFloat(style.marginRight) || 0;
    return item.getBoundingClientRect().width + marginRight;
  }

  let itemWidth = calcItemWidth();

  // nastavíme počáteční pozici
  function setPosition(animate = false) {
    if (!animate) track.style.transition = 'none';
    else track.style.transition = 'transform 0.4s ease';

    track.style.transform = `translateX(-${index * itemWidth}px)`;

    // po repaintu obnovíme transition (aby další pohyb byl animovaný)
    if (!animate) requestAnimationFrame(() => {
      track.style.transition = '';
    });
  }

  // začátek
  setPosition(false);

  // pohyb
  function moveTo(newIndex) {
    index = newIndex;
    setPosition(true);
  }

  nextBtn.addEventListener('click', () => moveTo(index + 1));
  prevBtn.addEventListener('click', () => moveTo(index - 1));

  // když přejedeme do clonované oblasti -> okamžitě "skočíme" do správné pozice (bez animace)
  track.addEventListener('transitionend', () => {
    // pokud jsme na pravé cloně
    if (index >= originalCount + cloneCount) {
      index -= originalCount;
      setPosition(false);
    }
    // pokud jsme na levé cloně
    if (index < cloneCount) {
      index += originalCount;
      setPosition(false);
    }
  });

  // při resize přepočítáme šířku a upravíme pozici bez animace
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      allItems = Array.from(track.children);
      itemWidth = calcItemWidth();
      setPosition(false);
    }, 80);
  });
});
