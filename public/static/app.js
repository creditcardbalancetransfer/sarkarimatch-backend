/**
 * SarkariMatch — Client-side interactions
 * Dark mode, language toggle, mobile menu, count-up stats,
 * scroll reveal (sections + staggered children), bookmarks,
 * countdown timers, carousel scroll, scroll-to-top, skeleton loading
 */

(function () {
  'use strict';

  // ─── Dark Mode ───────────────────────────────────────────────
  var THEME_KEY = 'sarkarimatch_theme';

  function getTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  function toggleTheme() {
    var current = getTheme();
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  applyTheme(getTheme());

  var themeBtn = document.getElementById('theme-toggle');
  var themeBtnMobile = document.getElementById('theme-toggle-mobile');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  if (themeBtnMobile) themeBtnMobile.addEventListener('click', toggleTheme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });


  // ─── Language Toggle ─────────────────────────────────────────
  var LANG_KEY = 'sarkarimatch_lang';

  function getLang() { return localStorage.getItem(LANG_KEY) || 'EN'; }

  function setLangDisplay(lang) {
    var display = lang === 'EN' ? 'EN' : 'हि';
    var el1 = document.getElementById('lang-text');
    var el2 = document.getElementById('lang-text-mobile');
    if (el1) el1.textContent = display;
    if (el2) el2.textContent = display;
  }

  function toggleLang() {
    var next = getLang() === 'EN' ? 'HI' : 'EN';
    localStorage.setItem(LANG_KEY, next);
    setLangDisplay(next);
  }

  setLangDisplay(getLang());

  var langBtn = document.getElementById('lang-toggle');
  var langBtnMobile = document.getElementById('lang-toggle-mobile');
  if (langBtn) langBtn.addEventListener('click', toggleLang);
  if (langBtnMobile) langBtnMobile.addEventListener('click', toggleLang);


  // ─── Mobile Menu ─────────────────────────────────────────────
  var menuBtn = document.getElementById('mobile-menu-btn');
  var closeBtnMenu = document.getElementById('mobile-menu-close');
  var menu = document.getElementById('mobile-menu');
  var overlay = document.getElementById('mobile-overlay');
  var hamburgerIcon = document.getElementById('hamburger-icon');
  var closeIcon = document.getElementById('close-icon');

  function openMenu() {
    if (!menu || !overlay) return;
    menu.classList.add('open');
    overlay.classList.remove('hidden');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    if (hamburgerIcon) hamburgerIcon.classList.add('hidden');
    if (closeIcon) closeIcon.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (closeBtnMenu) closeBtnMenu.focus();
  }

  function closeMenu() {
    if (!menu || !overlay) return;
    menu.classList.remove('open');
    overlay.classList.add('hidden');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    if (hamburgerIcon) hamburgerIcon.classList.remove('hidden');
    if (closeIcon) closeIcon.classList.add('hidden');
    document.body.style.overflow = '';
    if (menuBtn) menuBtn.focus();
  }

  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (closeBtnMenu) closeBtnMenu.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('open')) closeMenu();
  });

  if (menu) {
    menu.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && menu && menu.classList.contains('open')) closeMenu();
  });


  // ─── Count-Up Animation (Stats Bar) ─────────────────────────
  function formatIndian(num) {
    var str = num.toString();
    var last3 = str.substring(str.length - 3);
    var rest = str.substring(0, str.length - 3);
    if (rest !== '') last3 = ',' + last3;
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + last3;
  }

  function animateCountUp(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var customDisplay = el.getAttribute('data-display');
    var duration = 2000;
    var start = null;

    function ease(t) { return 1 - Math.pow(1 - t, 3); }

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var val = Math.floor(ease(p) * target);
      if (p < 1) {
        el.textContent = (target >= 10000 ? formatIndian(val) : val) + suffix;
        requestAnimationFrame(step);
      } else {
        el.textContent = customDisplay || ((target >= 10000 ? formatIndian(target) : target) + suffix);
      }
    }
    requestAnimationFrame(step);
  }

  var statsBar = document.getElementById('stats-bar');
  var statsAnimated = false;

  if (statsBar && 'IntersectionObserver' in window) {
    var statsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          statsBar.querySelectorAll('.stat-number').forEach(animateCountUp);
          statsObs.unobserve(statsBar);
        }
      });
    }, { threshold: 0.3 });
    statsObs.observe(statsBar);
  }


  // ─── Scroll Reveal (Sections + Staggered Children) ───────────
  if ('IntersectionObserver' in window) {
    // Section-level reveal
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          sectionObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-section').forEach(function (s) {
      sectionObs.observe(s);
    });

    // Child-level staggered reveal
    var childObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          childObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.reveal-child').forEach(function (c) {
      childObs.observe(c);
    });
  }


  // ─── Education Scroll Fades ──────────────────────────────────
  var eduScroll = document.querySelector('.edu-scroll');
  var fadeL = document.querySelector('.edu-fade-left');
  var fadeR = document.querySelector('.edu-fade-right');

  function updateEduFades() {
    if (!eduScroll || !fadeL || !fadeR) return;
    var sl = eduScroll.scrollLeft;
    var max = eduScroll.scrollWidth - eduScroll.clientWidth;
    fadeL.classList.toggle('hidden', sl <= 8);
    fadeR.classList.toggle('hidden', sl >= max - 8);
  }

  if (eduScroll) {
    eduScroll.addEventListener('scroll', updateEduFades, { passive: true });
    updateEduFades();
  }


  // ─── Bookmarks (localStorage) ────────────────────────────────
  var BM_KEY = 'sarkarimatch_bookmarks';

  function getBookmarks() {
    try {
      var data = JSON.parse(localStorage.getItem(BM_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }

  function saveBookmarks(arr) {
    localStorage.setItem(BM_KEY, JSON.stringify(arr));
  }

  function isBookmarked(slug) {
    return getBookmarks().indexOf(slug) !== -1;
  }

  function toggleBookmark(slug) {
    var bm = getBookmarks();
    var idx = bm.indexOf(slug);
    if (idx === -1) {
      bm.push(slug);
    } else {
      bm.splice(idx, 1);
    }
    saveBookmarks(bm);
    return idx === -1; // returns true if now bookmarked
  }

  // Initialize bookmark buttons
  function initBookmarks() {
    var btns = document.querySelectorAll('.bookmark-btn');
    btns.forEach(function (btn) {
      var slug = btn.getAttribute('data-slug');
      if (!slug) return;

      // Set initial state
      if (isBookmarked(slug)) {
        btn.classList.add('bookmarked');
      }

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var nowBookmarked = toggleBookmark(slug);
        if (nowBookmarked) {
          btn.classList.add('bookmarked');
          btn.setAttribute('aria-label', 'Remove bookmark');
        } else {
          btn.classList.remove('bookmarked');
          btn.setAttribute('aria-label', 'Bookmark this job');
        }
      });
    });
  }

  initBookmarks();


  // ─── Live Countdown Timers ───────────────────────────────────
  var countdownTimers = document.querySelectorAll('.countdown-timer');

  function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function updateCountdowns() {
    var now = Date.now();

    countdownTimers.forEach(function (timer) {
      var deadline = timer.getAttribute('data-deadline');
      if (!deadline) return;

      var target = new Date(deadline).getTime();
      var diff = target - now;

      var daysEl = timer.querySelector('.countdown-days');
      var hoursEl = timer.querySelector('.countdown-hours');
      var minsEl = timer.querySelector('.countdown-mins');
      var secsEl = timer.querySelector('.countdown-secs');

      if (diff <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
        return;
      }

      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      var secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = pad2(days);
      if (hoursEl) hoursEl.textContent = pad2(hours);
      if (minsEl) minsEl.textContent = pad2(mins);
      if (secsEl) secsEl.textContent = pad2(secs);
    });
  }

  if (countdownTimers.length > 0) {
    updateCountdowns(); // immediate
    setInterval(updateCountdowns, 1000); // every second
  }


  // ─── Closing-Soon Carousel Drag Scroll ───────────────────────
  var carousel = document.querySelector('.closing-carousel');

  if (carousel) {
    var isDown = false;
    var startX = 0;
    var scrollLeftStart = 0;

    carousel.addEventListener('mousedown', function (e) {
      isDown = true;
      carousel.style.cursor = 'grabbing';
      startX = e.pageX - carousel.offsetLeft;
      scrollLeftStart = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', function () {
      isDown = false;
      carousel.style.cursor = '';
    });

    carousel.addEventListener('mouseup', function () {
      isDown = false;
      carousel.style.cursor = '';
    });

    carousel.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - carousel.offsetLeft;
      var walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeftStart - walk;
    });

    // Set grab cursor
    carousel.style.cursor = 'grab';
  }


  // ─── Scroll-to-Top Button ───────────────────────────────────
  var scrollBtn = document.getElementById('scroll-to-top');

  if (scrollBtn) {
    var scrollThreshold = 500;
    var ticking = false;

    function checkScroll() {
      if (window.scrollY > scrollThreshold) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(checkScroll);
        ticking = true;
      }
    }, { passive: true });

    scrollBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initial check
    checkScroll();
  }


  // ─── Skeleton Loading Reveal ─────────────────────────────────
  // Show skeletons for 500ms then reveal actual content
  var skeletonContainers = document.querySelectorAll('.skeleton-container');
  var contentContainers = document.querySelectorAll('.content-container');

  if (skeletonContainers.length > 0) {
    setTimeout(function () {
      skeletonContainers.forEach(function (sk) {
        sk.classList.add('hidden');
      });
      contentContainers.forEach(function (ct) {
        ct.classList.add('loaded');
      });
    }, 500);
  }


  // ─── Jobs Matched For You (Homepage) ───────────────────────
  // When profile exists, change heading, run eligibility, sort by best_score,
  // attach eligibility badges to homepage job cards.

  var PROFILE_KEY_HOME = 'sarkarimatch_profile';
  var EDUCATION_RANKS_HOME = {
    '10th': 1, '12th': 2, 'iti': 2.5, 'diploma': 3,
    'graduate': 4, 'pg': 5, 'phd': 6
  };
  var CATEGORY_NORM_HOME = {
    'general': 'UR', 'ur': 'UR', 'obc': 'OBC',
    'sc': 'SC', 'st': 'ST', 'ews': 'EWS'
  };
  var DEGREE_ALIASES_HOME = {
    'b.tech/b.e': ['b.tech', 'be', 'b.e', 'b.e.', 'b.tech.', 'btech'],
    'b.sc': ['bsc', 'b.sc.'], 'b.com': ['bcom', 'b.com.'],
    'ba': ['b.a', 'b.a.'], 'bba': ['b.b.a'], 'bca': ['b.c.a'],
    'llb': ['ll.b', 'b.l'], 'b.ed': ['bed', 'b.ed.'], 'mbbs': ['m.b.b.s'],
    'm.tech/m.e': ['m.tech', 'me', 'm.e'], 'm.sc': ['msc', 'm.sc.'],
    'm.com': ['mcom'], 'ma': ['m.a'], 'mba': ['m.b.a'], 'mca': ['m.c.a']
  };

  function homeReadProfile() {
    try { var r = localStorage.getItem(PROFILE_KEY_HOME); return r ? JSON.parse(r) : null; }
    catch(e) { return null; }
  }

  function homeNormCat(c) {
    if (!c) return 'UR';
    return CATEGORY_NORM_HOME[c.toLowerCase().trim()] || c.toUpperCase().trim();
  }

  function homeCalcAge(dob, ref) {
    var bp = dob.split('-').map(Number), rp = ref.split('-').map(Number);
    var y = rp[0]-bp[0], m = rp[1]-bp[1], d = rp[2]-bp[2];
    if (d<0){m--;d+=new Date(rp[0],rp[1]-1,0).getDate();}
    if (m<0){y--;m+=12;}
    return {years:y,months:m,days:d};
  }

  function homeAgeRelax(cat,pwd,exsm,cge) {
    var c=homeNormCat(cat),b=0;
    if(c==='OBC')b=3;else if(c==='SC'||c==='ST')b=5;
    var a=0;if(pwd&&exsm)a+=10;else if(pwd)a+=10;else if(exsm)a+=5;
    if(cge)a+=5;return b+a;
  }

  function homeEduRank(l){return EDUCATION_RANKS_HOME[(l||'').toLowerCase().trim()]||0;}

  function homeInferEdu(t,j){
    if(!t)return j||'graduate';var l=t.toLowerCase();
    if(/ph\.?d|doctorate/i.test(l))return 'phd';
    if(/post[- ]?graduat|master|m\.tech|m\.sc|m\.com|m\.a\b|mba|mca/i.test(l))return 'pg';
    if(/graduat|b\.tech|b\.e\b|b\.sc|b\.com|b\.a\b|bba|bca|mbbs|bachelor/i.test(l))return 'graduate';
    if(/diploma/i.test(l))return 'diploma';if(/iti/i.test(l))return 'iti';
    if(/12th|10\+2|intermediate/i.test(l))return '12th';
    if(/10th|sslc|matricul/i.test(l))return '10th';return j||'graduate';
  }

  function homeFindCanon(inp){
    var lo=(inp||'').toLowerCase().trim();
    if(DEGREE_ALIASES_HOME[lo])return lo;
    for(var k in DEGREE_ALIASES_HOME){if(DEGREE_ALIASES_HOME[k].indexOf(lo)!==-1)return k;}
    return null;
  }

  function homeDegreesMatch(u,r){
    var ul=(u||'').toLowerCase().trim(),rl=(r||'').toLowerCase().trim();
    if(ul===rl)return true;
    var uc=homeFindCanon(ul),rc=homeFindCanon(rl);
    if(uc&&rc&&uc===rc)return true;
    if(ul.indexOf(rl)!==-1||rl.indexOf(ul)!==-1)return true;
    return false;
  }

  function homeParseAge(post,which){
    var s=post.age_limit||'';if(!s)return null;
    var m=s.match(/(\d+(?:\.\d+)?)\s*[-\u2013\u2014]\s*(\d+(?:\.\d+)?)/);
    if(m)return which==='min'?Math.floor(parseFloat(m[1])):Math.ceil(parseFloat(m[2]));
    if(/no\s+(upper\s+)?age\s+limit/i.test(s))return which==='max'?99:null;
    return null;
  }

  function homeParseDegReq(t){
    if(!t)return{degrees:null};
    if(/any\s+(discipline|degree|stream)/i.test(t))return{degrees:null};
    var d=[],pats=[/\bB\.?E\.?\/?B\.?Tech\b/i,/\bB\.?Sc\b/i,/\bB\.?Com\b/i,/\bB\.?A\b/i,/\bMBBS\b/i,/\bM\.?Tech\b/i,/\bMBA\b/i,/\bMCA\b/i];
    for(var i=0;i<pats.length;i++){var mm=t.match(pats[i]);if(mm)d.push(mm[0]);}
    return{degrees:d.length>0?d:null};
  }

  function homeEvalPost(profile, post, job){
    var lastDate=(job.important_dates&&job.important_dates.last_date)||'2026-03-03';
    var ageMin=homeParseAge(post,'min');if(ageMin===null)ageMin=job.age_min||0;
    var ageMax=homeParseAge(post,'max');if(ageMax===null)ageMax=job.age_max||0;
    var relax=homeAgeRelax(profile.category,profile.is_pwd,profile.is_ex_serviceman,profile.is_central_govt_employee);

    var ageRes='pass';
    if(ageMin===0&&ageMax===0){ageRes='pass';}
    else{var age=homeCalcAge(profile.dob,lastDate);var eMax=ageMax+relax;
      if(age.years<ageMin)ageRes='fail';else if(age.years>eMax)ageRes='fail';}

    var reqLvl=homeInferEdu(post.education_required,job.education_level);
    var uR=homeEduRank(profile.education_level),rR=homeEduRank(reqLvl);
    var eduRes=(uR===0||rR===0)?'unknown':(uR>=rR?'pass':'fail');

    var degReq=homeParseDegReq(post.education_required);
    var degRes='not_required';
    if(degReq.degrees&&degReq.degrees.length>0){
      if(!profile.degree){degRes='unknown';}
      else{var mt=false;for(var i=0;i<degReq.degrees.length;i++){if(homeDegreesMatch(profile.degree,degReq.degrees[i])){mt=true;break;}}
        degRes=mt?'pass':'fail';}
    }

    var wts={age:30,education:25,degree:20,percentage:10,category_vacancy:15};
    var cks={age:ageRes,education:eduRes,degree:degRes,percentage:'not_required',category_vacancy:'unknown'};
    var sc=0;for(var ck in cks){var w=wts[ck]||0;var rv=cks[ck];
      if(rv==='pass'||rv==='not_required')sc+=w;else if(rv==='unknown')sc+=w*0.5;}
    sc=Math.round(sc);
    return{post_name:post.post_name,score:sc,label:sc>=90?'eligible':(sc>=55?'partial':'not_eligible')};
  }

  function homeEvalJob(profile, job){
    var posts=(job.posts&&job.posts.length>0)?job.posts:[{
      post_name:job.notification_title||'Main Post',
      vacancies_total:job.total_vacancies||0,
      education_required:job.education_level||'',
      age_limit:(job.age_min&&job.age_max)?job.age_min+'\u2013'+job.age_max+' years':'',
      salary:'As per rules'
    }];
    var results=[];
    for(var i=0;i<posts.length;i++)results.push(homeEvalPost(profile,posts[i],job));
    results.sort(function(a,b){return b.score-a.score;});
    var bestScore=results.length>0?results[0].score:0;
    var elig=0,part=0;
    for(var j=0;j<results.length;j++){if(results[j].label==='eligible')elig++;else if(results[j].label==='partial')part++;}
    return{
      job_id:job.id,best_score:bestScore,
      overall_label:bestScore>=90?'eligible':(bestScore>=55?'partial':'not_eligible'),
      eligible_posts:elig,partial_posts:part,total_posts:results.length
    };
  }

  function initJobsForYou() {
    var heading = document.getElementById('latest-jobs-heading');
    var subtitle = document.getElementById('latest-jobs-subtitle');
    var grid = document.getElementById('latest-jobs-grid');
    var expandNote = document.getElementById('latest-jobs-expand-note');
    var dataScript = document.getElementById('home-jobs-data');

    if (!heading || !grid || !dataScript) return;

    var profile = homeReadProfile();
    if (!profile) return;

    // Parse embedded job data
    var jobsMap = {};
    try { jobsMap = JSON.parse(dataScript.textContent); } catch(e) { return; }

    // Change heading
    heading.textContent = 'Jobs Matched For You';
    if (subtitle) subtitle.textContent = 'Personalized based on your profile \u2014 best matches first';

    // Evaluate all 6 jobs
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.job-card'));
    var evaluated = [];
    var allNotEligible = true;

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var jobId = card.getAttribute('data-job-id');
      var jobObj = jobsMap[jobId];
      if (!jobObj) { evaluated.push({ card: card, score: 0, label: 'not_eligible' }); continue; }
      var result = homeEvalJob(profile, jobObj);
      evaluated.push({ card: card, score: result.best_score, label: result.overall_label, result: result });

      if (result.overall_label === 'eligible' || result.overall_label === 'partial') {
        allNotEligible = false;
      }

      // Attach mini eligibility badge
      var badgeEl = card.querySelector('[data-home-eligibility]');
      if (badgeEl) {
        var colorMap = {
          eligible: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500', lbl: 'Eligible' },
          partial: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', lbl: 'Partial' },
          not_eligible: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500', lbl: 'Not Eligible' }
        };
        var c = colorMap[result.overall_label] || colorMap.not_eligible;
        badgeEl.innerHTML =
          '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-bold ' + c.bg + ' ' + c.text + '">' +
            '<span class="w-1.5 h-1.5 rounded-full ' + c.dot + '"></span>' +
            c.lbl + ' ' + result.best_score + '%' +
          '</span>';
        badgeEl.classList.remove('hidden');
      }
    }

    // Sort by best_score descending
    evaluated.sort(function(a, b) { return b.score - a.score; });

    // Reorder DOM
    for (var k = 0; k < evaluated.length; k++) {
      grid.appendChild(evaluated[k].card);
    }

    // Show expand note if all 6 are not eligible
    if (allNotEligible && expandNote) {
      expandNote.classList.remove('hidden');
    }
  }

  // Run after a short delay to let skeleton loading finish
  setTimeout(function() {
    initJobsForYou();

    // Also listen for profile updates on homepage
    window.addEventListener('profile-updated', initJobsForYou);
    window.addEventListener('sarkarimatch-profile-changed', initJobsForYou);
  }, 600);

})();
