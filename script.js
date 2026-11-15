(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const pageIndicator = document.getElementById('pageIndicator');
  const progressBar = document.getElementById('progressBar');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const notesBtn = document.getElementById('notesBtn');
  const viewport = document.getElementById('slidesViewport');
  const controlsBar = document.querySelector('.controls-bar');

  let currentIndex = 0;
  const totalSlides = slides.length;
  let notesWindow = null;
  let hideControlsTimer = null;
  let isHoveringControls = false;

  /* 발표자 메모 팝업 업데이트 */
  function updateNotes() {
    if (!notesWindow || notesWindow.closed) return;
    try {
      const activeSlide = slides[currentIndex];
      const note = activeSlide.getAttribute('data-notes') || '(작성된 메모가 없습니다)';
      const slideTitle = activeSlide.querySelector('h2, .cover-title')?.textContent || `슬라이드 ${currentIndex + 1}`;

      const titleElem = notesWindow.document.getElementById('st');
      const numElem = notesWindow.document.getElementById('sn');
      const textElem = notesWindow.document.getElementById('nt');

      if (titleElem) titleElem.textContent = slideTitle;
      if (numElem) numElem.textContent = `${currentIndex + 1} / ${totalSlides}`;
      if (textElem) textElem.textContent = note;
    } catch (e) {
      // 팝업 통신 예외 시 무시
    }
  }

  /* 발표자 메모 팝업 토글 */
  function toggleNotes() {
    if (notesWindow && !notesWindow.closed) {
      notesWindow.close();
      notesWindow = null;
      return;
    }

    notesWindow = window.open('', 'SpeakerNotes', 'width=520,height=420,top=100,left=100');
    if (!notesWindow) return;

    notesWindow.document.write(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>발표자 메모 — 바이브코딩</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #fef7f0;
      color: #2d2d2d;
      padding: 24px;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0e0d0;
    }
    .slide-badge {
      background: #ff6b6b;
      color: #fff;
      font-weight: 700;
      font-size: 13px;
      padding: 3px 12px;
      border-radius: 999px;
    }
    .title {
      font-size: 15px;
      font-weight: 600;
      color: #777;
    }
    .label {
      font-size: 12px;
      font-weight: 700;
      color: #ff6b6b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .notes-box {
      background: #ffffff;
      border: 1.5px solid #f0e0d0;
      border-radius: 16px;
      padding: 20px;
      font-size: 17px;
      line-height: 1.7;
      color: #2d2d2d;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      min-height: 220px;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="slide-badge" id="sn"></span>
    <span class="title" id="st"></span>
  </div>
  <div class="label">📝 발표 멘트 & 참고 사항</div>
  <div class="notes-box" id="nt"></div>
</body>
</html>`);
    notesWindow.document.close();
    updateNotes();
  }

  function renderSlide(index) {
    currentIndex = Math.max(0, Math.min(index, totalSlides - 1));

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === currentIndex);
    });

    pageIndicator.textContent = `${currentIndex + 1} / ${totalSlides}`;
    progressBar.style.width = `${((currentIndex + 1) / totalSlides) * 100}%`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalSlides - 1;

    updateNotes();
  }

  function goNext() {
    if (currentIndex < totalSlides - 1) {
      renderSlide(currentIndex + 1);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      renderSlide(currentIndex - 1);
    }
  }

  /* 버튼 클릭 이벤트 */
  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);
  if (notesBtn) notesBtn.addEventListener('click', toggleNotes);

  /* 키보드 조작 */
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      goNext();
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      goPrev();
    } else if (event.key === 'Home') {
      event.preventDefault();
      renderSlide(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      renderSlide(totalSlides - 1);
    } else if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      toggleFullscreen();
    } else if (event.key.toLowerCase() === 's') {
      event.preventDefault();
      toggleNotes();
    }
  });

  /* 모바일/터치 스와이프 지원 */
  let touchStartX = 0;
  viewport.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  viewport.addEventListener('touchend', (event) => {
    const diffX = event.changedTouches[0].screenX - touchStartX;
    if (diffX < -50) {
      goNext();
    } else if (diffX > 50) {
      goPrev();
    }
  }, { passive: true });

  /* 전체 화면 전환 */
  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        fullscreenBtn.textContent = '원래 화면';
      } else {
        await document.exitFullscreen();
        fullscreenBtn.textContent = '전체 화면';
      }
    } catch {
      // 브라우저 제한 시 무시
    }
  }

  fullscreenBtn.addEventListener('click', toggleFullscreen);

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      fullscreenBtn.textContent = '전체 화면';
    }
    showControls();
  });

  /* 하단 조작 바 자동 숨김 및 표시 */
  function showControls() {
    if (!controlsBar) return;
    controlsBar.classList.remove('is-hidden');
    resetHideControlsTimer();
  }

  function hideControls() {
    if (!controlsBar || isHoveringControls) return;
    controlsBar.classList.add('is-hidden');
  }

  function resetHideControlsTimer() {
    clearTimeout(hideControlsTimer);
    hideControlsTimer = setTimeout(() => {
      hideControls();
    }, 2500);
  }

  // 마우스 움직임, 터치 시 조작 바 표시
  document.addEventListener('mousemove', (event) => {
    showControls();
    // 마우스가 화면 하단(80px 이내)에 머무는 동안에는 숨김 타이머 정지
    if (window.innerHeight - event.clientY <= 80) {
      clearTimeout(hideControlsTimer);
    }
  });

  document.addEventListener('touchstart', showControls, { passive: true });

  // 조작 바 위에 마우스가 머물 때는 숨기지 않음
  if (controlsBar) {
    controlsBar.addEventListener('mouseenter', () => {
      isHoveringControls = true;
      clearTimeout(hideControlsTimer);
      controlsBar.classList.remove('is-hidden');
    });

    controlsBar.addEventListener('mouseleave', () => {
      isHoveringControls = false;
      resetHideControlsTimer();
    });

    controlsBar.addEventListener('focusin', () => {
      isHoveringControls = true;
      showControls();
    });

    controlsBar.addEventListener('focusout', () => {
      isHoveringControls = false;
      resetHideControlsTimer();
    });
  }

  // 초기 렌더링 및 2.5초 후 자동 숨김
  renderSlide(0);
  resetHideControlsTimer();
})();
