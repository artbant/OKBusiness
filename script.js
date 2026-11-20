(() => {
  const header = document.querySelector('#floatingHeader');
  const hero = document.querySelector('.hero');
  const stepsSection = document.querySelector('.steps');
  const benefitSection = document.querySelector('.benefits');
  const benefitInner = document.querySelector('.benefits-inner');
  const benefitStack = document.querySelector('.benefit-stack');
  const benefitCards = [...document.querySelectorAll('.benefit-card')];
  const stepsPanel = document.querySelector('.steps-panel');
  const stepsCta = document.querySelector('.steps-cta');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const updateHeader = () => {
    const shouldShow = window.scrollY > hero.offsetHeight - 110;
    const stepsRect = stepsSection?.getBoundingClientRect();
    const inSteps = stepsRect && stepsRect.top <= header.offsetHeight + 16 && stepsRect.bottom > header.offsetHeight;
    header.classList.toggle('is-visible', shouldShow);
    header.classList.toggle('is-suppressed', Boolean(shouldShow && inSteps));
  };

  const updateBenefits = () => {
    if (reducedMotion.matches || !benefitSection || !benefitInner || !benefitStack) return;
    const sectionTop = benefitSection.getBoundingClientRect().top;
    const runway = Math.max(1, benefitSection.offsetHeight - benefitInner.offsetHeight);
    const progress = clamp(-sectionTop / runway, 0, 1);
    const stackRect = benefitStack.getBoundingClientRect();
    const stackTop = stackRect.top - benefitInner.getBoundingClientRect().top;
    const travel = Math.max(0, window.innerHeight - stackTop + 44);
    const greenProgress = clamp((progress - .04) / .44, 0, 1);
    const blueProgress = clamp((progress - .52) / .44, 0, 1);
    const arcLift = Math.min(46, window.innerHeight * .055);

    const moveCard = (card, cardProgress, fromLeft) => {
      if (!card) return;
      const sideStart = fromLeft
        ? -stackRect.left - card.offsetWidth - 40
        : window.innerWidth - stackRect.left + 40;
      const x = sideStart * (1 - cardProgress);
      const y = travel * (1 - cardProgress) - Math.sin(Math.PI * cardProgress) * arcLift;
      const rotation = (fromLeft ? -4 : 4) * (1 - cardProgress);
      card.style.setProperty('--card-x', `${x}px`);
      card.style.setProperty('--card-y', `${y}px`);
      card.style.setProperty('--card-rotation', `${rotation}deg`);
    };

    moveCard(benefitCards[1], greenProgress, true);
    moveCard(benefitCards[2], blueProgress, false);
  };

  const updateStepsButton = () => {
    if (reducedMotion.matches || !stepsPanel || !stepsCta) return;
    const viewportHeight = window.innerHeight;
    const buttonTop = stepsCta.getBoundingClientRect().top;
    const expansion = clamp((viewportHeight * .98 - buttonTop) / (viewportHeight * .5), 0, 1);
    const panelStyle = getComputedStyle(stepsPanel);
    const fullWidth = stepsPanel.clientWidth - parseFloat(panelStyle.paddingLeft) - parseFloat(panelStyle.paddingRight);
    const compactWidth = Math.min(fullWidth, window.matchMedia('(max-width: 640px)').matches ? 200 : 320);
    stepsCta.style.setProperty('--steps-cta-width', `${compactWidth + (fullWidth - compactWidth) * expansion}px`);
  };

  let frame = 0;
  const updateOnScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      updateHeader();
      updateBenefits();
      updateStepsButton();
    });
  };

  updateOnScroll();
  window.addEventListener('scroll', updateOnScroll, { passive: true });
  window.addEventListener('resize', updateOnScroll, { passive: true });
  window.addEventListener('load', updateOnScroll, { once: true });
  if (document.fonts?.ready) document.fonts.ready.then(updateOnScroll);

  const artObjects = [...document.querySelectorAll('.art-object')];
  if (finePointer && !reducedMotion.matches) {
    hero.addEventListener('pointermove', (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      artObjects.forEach((object) => {
        const depthX = Number(object.dataset.depthX || 0.2);
        const depthY = Number(object.dataset.depthY || 0.2);
        const tx = (x * depthX + y * depthY * .28) * 120;
        const ty = (y * depthY - x * depthX * .22) * 110;
        const baseRotation = Number(object.dataset.baseRotation || 0);
        const rotation = baseRotation + (x + y) * Number(object.dataset.turn || 1.5);
        object.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rotation}deg)`;
      });
    });
    hero.addEventListener('pointerleave', () => {
      artObjects.forEach((object) => { object.style.transform = ''; });
    });
  }

  if (!finePointer && !reducedMotion.matches) {
    artObjects.forEach((object, index) => {
      object.style.setProperty('--float-x', `${((index % 3) - 1) * 5}px`);
      object.style.setProperty('--float-y', `${-5 - ((index * 3) % 8)}px`);
      object.style.setProperty('--float-rotation', `${((index % 5) - 2) * .7}deg`);
      object.style.animation = `float ${5 + (index % 4)}s ease-in-out ${-(index % 5)}s infinite alternate`;
    });
    const style = document.createElement('style');
    style.textContent = '@keyframes float { from { translate: 0 0; rotate: 0deg; } to { translate: var(--float-x) var(--float-y); rotate: var(--float-rotation); } }';
    document.head.append(style);
  }

  const eligibility = document.querySelector('.eligibility');
  const pretzel = document.querySelector('.eligibility-pretzel');
  if (finePointer && !reducedMotion.matches && eligibility && pretzel) {
    eligibility.addEventListener('pointermove', (event) => {
      const bounds = eligibility.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      const tx = (x * Number(pretzel.dataset.depthX) + y * .08) * 42;
      const ty = (y * Number(pretzel.dataset.depthY) - x * .06) * 36;
      const rotation = (x + y) * Number(pretzel.dataset.turn);
      pretzel.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rotation}deg)`;
    });
    eligibility.addEventListener('pointerleave', () => { pretzel.style.transform = ''; });
  }
})();
