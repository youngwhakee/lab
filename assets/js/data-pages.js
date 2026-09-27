(() => {

  /* =========================================================
     BASE
  ========================================================= */

  const scriptEl = document.currentScript;

  const siteRoot =
    new URL('../../', scriptEl.src);

  const page =
    document.body.dataset.page || '';


  const esc = (value = '') => {

    return String(value ?? '')
      .replace(
        /[&<>'"]/g,
        char => ({
          '&':'&amp;',
          '<':'&lt;',
          '>':'&gt;',
          "'":'&#39;',
          '"':'&quot;'
        }[char])
      );

  };


  const asset = (path = '') => {

    if(!path){
      return '';
    }

    return new URL(
      String(path).replace(/^\/+/, ''),
      siteRoot
    ).href;

  };


  const jsonUrl = name =>
    new URL(
      `assets/data/${name}.json`,
      siteRoot
    ).href;


  const loadFailures =
    new Set();


  const load = async name => {

    try{

      const response =
        await fetch(
          `${jsonUrl(name)}?v=${Date.now()}`,
          {
            cache:'no-store'
          }
        );


      if(!response.ok){

        throw new Error(
          `HTTP ${response.status}`
        );

      }


      const json =
        await response.json();


      loadFailures.delete(name);

      return json;


    }catch(error){

      console.warn(
        `KEE LAB: failed to load ${name}.json`,
        error
      );


      loadFailures.add(name);

      return null;

    }

  };


  const truthy = value => {

    if(value === true){
      return true;
    }


    return [
      'true',
      '1',
      'yes',
      'y'
    ].includes(
      String(value ?? '')
        .trim()
        .toLowerCase()
    );

  };


  const pick = (object, ...keys) => {

    if(
      !object ||
      typeof object !== 'object'
    ){
      return '';
    }


    for(const key of keys){

      if(
        Object.prototype
          .hasOwnProperty
          .call(object,key) &&
        object[key] !== undefined &&
        object[key] !== null
      ){
        return object[key];
      }

    }


    return '';

  };


  const asArray = (
    raw,
    ...keys
  ) => {

    if(Array.isArray(raw)){
      return raw;
    }


    if(
      !raw ||
      typeof raw !== 'object'
    ){
      return [];
    }


    for(const key of keys){

      if(Array.isArray(raw[key])){
        return raw[key];
      }

    }


    if(Array.isArray(raw.data)){
      return raw.data;
    }


    if(Array.isArray(raw.rows)){
      return raw.rows;
    }


    return [];

  };


  const isVisibleRow = row => {

    if(
      !row ||
      typeof row !== 'object'
    ){
      return false;
    }


    const hasActive =
      Object.prototype
        .hasOwnProperty
        .call(row,'active') ||
      Object.prototype
        .hasOwnProperty
        .call(row,'Active');


    if(!hasActive){
      return true;
    }


    const value =
      pick(
        row,
        'active',
        'Active'
      );


    if(
      value === '' ||
      value === null ||
      value === undefined
    ){
      return true;
    }


    return truthy(value);

  };


  const empty = message => {

    return `
      <div class="data-empty glass">
        <b>등록된 내용이 없습니다.</b>
        ${
          message
            ? `<span>${esc(message)}</span>`
            : ''
        }
      </div>
    `;

  };


  const externalLink = value => {

    const raw =
      String(value || '').trim();


    if(!raw){
      return '#';
    }


    if(
      /^javascript:/i.test(raw)
    ){
      return '#';
    }


    if(
      /^10\.\d{4,9}\//i.test(raw)
    ){
      return `https://doi.org/${raw}`;
    }


    if(
      /^https?:\/\//i.test(raw)
    ){
      return raw;
    }


    if(/^\/\//.test(raw)){
      return `https:${raw}`;
    }


    if(/^www\./i.test(raw)){
      return `https://${raw}`;
    }


    if(
      /^[^\s/]+\.[^\s/]+/.test(raw)
    ){
      return `https://${raw}`;
    }


    return raw;

  };


  const safeLink = value =>
    esc(
      externalLink(value)
    );


  const imgStyle = path => {

    if(!path){
      return '';
    }


    return `
      style="
        background-image:
          linear-gradient(
            180deg,
            rgba(7,95,130,.04),
            rgba(7,95,130,.18)
          ),
          url('${asset(path)}');
        background-size:cover;
        background-position:center;
      "
    `;

  };


  const fmtDate = (
    value,
    mode = 'full'
  ) => {

    if(!value){
      return '';
    }


    const source =
      String(value);


    const date =
      new Date(
        source +
        (
          source.length === 10
            ? 'T00:00:00'
            : ''
        )
      );


    if(
      Number.isNaN(
        date.getTime()
      )
    ){
      return esc(value);
    }


    if(mode === 'month'){

      return date
        .toLocaleDateString(
          'en-US',
          {
            month:'short',
            year:'numeric'
          }
        )
        .toUpperCase()
        .replace(
          ' ',
          ' · '
        );

    }


    return date
      .toLocaleDateString(
        'en-US',
        {
          month:'short',
          day:'2-digit',
          year:'numeric'
        }
      )
      .toUpperCase()
      .replace(
        ',',
        ' ·'
      );

  };


  const yearOf = value =>
    String(value || '')
      .slice(0,4);



  /* =========================================================
     HOME
  ========================================================= */

  async function initHome(){

    const [
      rawPublications,
      rawNews,
      rawProfessor
    ] =
      await Promise.all([
        load('publications'),
        load('news'),
        load('professor')
      ]);


    const publications =
      asArray(
        rawPublications,
        'publications',
        'Publications'
      )
      .filter(isVisibleRow);


    const news =
      asArray(
        rawNews,
        'news',
        'News'
      )
      .filter(isVisibleRow);


    const professor =
      (
        rawProfessor &&
        !Array.isArray(rawProfessor)
      )
        ? rawProfessor
        : {};


    const profCard =
      document.querySelector(
        '.prof-card'
      );


    if(
      profCard &&
      Object.keys(professor).length
    ){

      const photo =
        profCard.querySelector(
          '.prof-photo'
        );


      if(
        photo &&
        professor.photo
      ){

        photo.classList.add(
          'has-photo'
        );


        photo.innerHTML = '';


        photo.style.backgroundImage =
          `linear-gradient(
            180deg,
            rgba(7,95,130,.03),
            rgba(7,95,130,.12)
          ),
          url('${asset(professor.photo)}')`;


        photo.style.backgroundSize =
          'cover';


        photo.style.backgroundPosition =
          'center top';

      }


      const en =
        profCard.querySelector(
          '.prof-info .label'
        );


      const ko =
        profCard.querySelector(
          '.prof-info h3'
        );


      const role =
        profCard.querySelector(
          '.prof-role'
        );


      const bio =
        profCard.querySelector(
          '.prof-info > p'
        );


      const research =
        profCard.querySelector(
          '.meta-row span'
        );


      if(
        en &&
        professor.name_en
      ){

        en.textContent =
          String(
            professor.name_en
          ).toUpperCase();

      }


      if(
        ko &&
        professor.name_ko
      ){

        ko.textContent =
          professor.name_ko;

      }


      if(role){

        role.textContent =
          [
            professor.title,
            professor.university
          ]
          .filter(Boolean)
          .join(' · ') ||
          role.textContent;

      }


      if(
        bio &&
        professor.home_bio
      ){

        bio.textContent =
          professor.home_bio;

      }


      if(
        research &&
        Array.isArray(
          professor.research_interests
        ) &&
        professor.research_interests.length
      ){

        research.textContent =
          professor
            .research_interests
            .join(' · ');

      }

    }


    const pubList =
      document.querySelector(
        '.pub-list'
      );


    if(pubList){

      const chosen =
        [...publications]
          .sort(
            (a,b) =>
              (
                Number(
                  truthy(b.featured)
                ) -
                Number(
                  truthy(a.featured)
                )
              ) ||
              (
                Number(b.year) -
                Number(a.year)
              )
          )
          .slice(0,3);


      pubList.innerHTML =
        chosen.length
          ? chosen
              .map(
                publication => `

                  <a
                    class="pub"
                    href="publications/"
                  >

                    <span class="year">
                      ${esc(publication.year)}
                    </span>

                    <div>

                      <strong>
                        ${esc(publication.title)}
                      </strong>

                      <small>
                        ${esc(
                          [
                            publication.authors,
                            publication.venue
                          ]
                          .filter(Boolean)
                          .join(' · ')
                        )}
                      </small>

                    </div>

                    <span class="pill">
                      ${esc(
                        String(
                          publication.type ||
                          'WORK'
                        )
                        .toUpperCase()
                      )}
                    </span>

                  </a>

                `
              )
              .join('')
          : empty(
              '등록된 연구성과가 없습니다.'
            );

    }


    const board =
      document.getElementById(
        'homeNewsBoard'
      );


    if(board){

      const chosen =
        [...news]
          .sort(
            (a,b) =>
              String(
                b.date || ''
              )
              .localeCompare(
                String(
                  a.date || ''
                )
              )
          )
          .slice(0,5);


      board.innerHTML =
        chosen.length
          ? chosen
              .map(
                item => `

                  <a
                    class="home-news-row"
                    href="${
                      item.link_url
                        ? safeLink(
                            item.link_url
                          )
                        : 'news/'
                    }"
                    ${
                      item.link_url
                        ? 'target="_blank" rel="noopener noreferrer"'
                        : ''
                    }
                  >

                    <span class="date">
                      ${fmtDate(
                        item.date,
                        'month'
                      )}
                    </span>

                    <span>

                      <strong>
                        ${esc(item.title)}
                      </strong>

                      <small>
                        ${esc(
                          item.category ||
                          'news'
                        )}
                      </small>

                    </span>

                    <span class="arr">
                      ↗
                    </span>

                  </a>

                `
              )
              .join('')
          : empty(
              '등록된 소식이 없습니다.'
            );

    }

  }



  /* =========================================================
     PROFESSOR
  ========================================================= */

  async function initProfessor(){

    const [
      rawProfessor,
      rawPublications
    ] =
      await Promise.all([
        load('professor'),
        load('publications')
      ]);


    const professor =
      (
        rawProfessor &&
        !Array.isArray(rawProfessor)
      )
        ? rawProfessor
        : {};


    const publications =
      asArray(
        rawPublications,
        'publications',
        'Publications'
      )
      .filter(isVisibleRow);


    if(
      !Object.keys(professor).length
    ){
      return;
    }


    const portrait =
      document.querySelector(
        '.prof-portrait'
      );


    if(
      portrait &&
      professor.photo
    ){

      portrait.classList.add(
        'has-photo'
      );


      portrait.innerHTML = '';


      portrait.style.backgroundImage =
        `linear-gradient(
          180deg,
          rgba(7,95,130,.02),
          rgba(7,95,130,.10)
        ),
        url('${asset(professor.photo)}')`;


      portrait.style.backgroundSize =
        'cover';


      portrait.style.backgroundPosition =
        'center top';

    }


    const intro =
      document.querySelector(
        '.prof-intro'
      );


    if(intro){

      const h1 =
        intro.querySelector('h1');


      const role =
        intro.querySelector(
          '.role'
        );


      const paragraph =
        intro.querySelector('p');


      if(
        h1 &&
        professor.name_en
      ){

        const parts =
          String(
            professor.name_en
          )
          .trim()
          .split(/\s+/);


        if(parts.length > 1){

          h1.innerHTML =
            `${esc(
              parts
                .slice(0,-1)
                .join(' ')
            )}<br><em style="font-style:normal;color:var(--ssu-dark)">${esc(
              parts.at(-1)
            )}</em>`;

        }else{

          h1.textContent =
            professor.name_en;

        }

      }


      if(role){

        role.textContent =
          [
            professor.title,
            professor.university
          ]
          .filter(Boolean)
          .join(' · ') ||
          role.textContent;

      }


      if(
        paragraph &&
        professor.home_bio
      ){

        paragraph.textContent =
          professor.home_bio;

      }

    }


    const works =
      document.querySelector(
        '#works .selected'
      );


    if(
      works &&
      publications.length
    ){

      const selected =
        [...publications]
          .sort(
            (a,b) =>
              (
                Number(
                  truthy(b.featured)
                ) -
                Number(
                  truthy(a.featured)
                )
              ) ||
              (
                Number(b.year) -
                Number(a.year)
              )
          )
          .slice(0,3);


      works.innerHTML =
        selected
          .map(
            publication => `

              <div class="work">

                <span class="year">
                  ${esc(publication.year)}
                </span>

                <div>

                  <b>
                    ${esc(publication.title)}
                  </b>

                  <br>

                  <small>
                    ${esc(
                      [
                        publication.authors,
                        publication.venue
                      ]
                      .filter(Boolean)
                      .join(' · ')
                    )}
                  </small>

                </div>

                <span></span>

              </div>

            `
          )
          .join('');

    }

  }



  /* =========================================================
     MEMBERS
  ========================================================= */

  async function initMembers(){

    const raw =
      await load('members');


    const data =
      asArray(
        raw,
        'members',
        'Members'
      )
      .filter(isVisibleRow);


    const root =
      document.getElementById(
        'membersDynamic'
      );


    if(!root){
      return;
    }


    root.classList.add(
      'visible'
    );


    const labels = {
      phd:'Doctoral Students',
      ma:"Master's Students",
      researcher:'Researchers',
      other:'Other Members'
    };


    const order = [
      'phd',
      'ma',
      'researcher',
      'other'
    ];


    const filters =
      [
        ...document.querySelectorAll(
          '.filters .filter'
        )
      ];


    const modal =
      document.getElementById(
        'memberModal'
      );


    const modalPhoto =
      document.getElementById(
        'memberModalPhoto'
      );


    const modalName =
      document.getElementById(
        'memberModalName'
      );


    const modalEn =
      document.getElementById(
        'memberModalEn'
      );


    const modalRole =
      document.getElementById(
        'memberModalRole'
      );


    const modalBio =
      document.getElementById(
        'memberModalBio'
      );


    const modalResearch =
      document.getElementById(
        'memberModalResearch'
      );


    const modalEducation =
      document.getElementById(
        'memberModalEducation'
      );


    const modalActions =
      document.getElementById(
        'memberModalActions'
      );


    const toast =
      document.getElementById(
        'copyToast'
      );


    const copyEmail =
      async email => {

        if(!email){
          return;
        }


        try{

          await navigator
            .clipboard
            .writeText(email);

        }catch(error){

          const textarea =
            document.createElement(
              'textarea'
            );


          textarea.value =
            email;


          textarea.style.position =
            'fixed';


          textarea.style.opacity =
            '0';


          document.body
            .appendChild(
              textarea
            );


          textarea.select();


          document.execCommand(
            'copy'
          );


          textarea.remove();

        }


        if(toast){

          toast.textContent =
            '이메일 주소가 클립보드에 복사되었습니다.';


          toast.classList.add(
            'show'
          );


          setTimeout(
            () =>
              toast.classList.remove(
                'show'
              ),
            1800
          );

        }

      };


    const closeModal = () => {

      if(!modal){
        return;
      }


      modal.classList.remove(
        'open'
      );


      modal.setAttribute(
        'aria-hidden',
        'true'
      );


      document.body.style.overflow =
        '';

    };


    const openModal = member => {

      if(!modal){
        return;
      }


      if(modalPhoto){

        modalPhoto.style.backgroundImage =
          member.photo
            ? `linear-gradient(
                180deg,
                rgba(7,95,130,.03),
                rgba(7,95,130,.12)
              ),
              url('${asset(member.photo)}')`
            : 'linear-gradient(145deg,var(--ssu-deep),var(--ssu-medium))';


        modalPhoto.style.backgroundSize =
          'cover';


        modalPhoto.style.backgroundPosition =
          'center top';

      }


      if(modalName){

        modalName.textContent =
          member.name_ko ||
          member.name_en ||
          'Member';

      }


      if(modalEn){

        modalEn.textContent =
          (
            member.name_ko &&
            member.name_en
          )
            ? member.name_en
            : '';

      }


      if(modalRole){

        modalRole.textContent =
          member.role_label ||
          labels[
            member.role_group
          ] ||
          '';

      }


      if(modalBio){

        modalBio.textContent =
          member.bio || '';


        modalBio.style.display =
          member.bio
            ? 'block'
            : 'none';

      }


      if(modalResearch){

        modalResearch.textContent =
          member.research_interests ||
          '—';

      }


      if(modalEducation){

        modalEducation.textContent =
          member.education ||
          '—';


        if(
          modalEducation.parentElement
        ){

          modalEducation
            .parentElement
            .style
            .display =
              member.education
                ? 'grid'
                : 'none';

        }

      }


      if(modalActions){

        modalActions.innerHTML =
          '';


        if(member.email){

          const button =
            document.createElement(
              'button'
            );


          button.type =
            'button';


          button.textContent =
            'EMAIL COPY';


          button.addEventListener(
            'click',
            () =>
              copyEmail(
                member.email
              )
          );


          modalActions
            .appendChild(
              button
            );

        }


        if(member.profile_url){

          const link =
            document.createElement(
              'a'
            );


          link.href =
            externalLink(
              member.profile_url
            );


          link.target =
            '_blank';


          link.rel =
            'noopener noreferrer';


          link.textContent =
            'PROFILE ↗';


          modalActions
            .appendChild(
              link
            );

        }

      }


      modal.classList.add(
        'open'
      );


      modal.setAttribute(
        'aria-hidden',
        'false'
      );


      document.body.style.overflow =
        'hidden';

    };


    document
      .getElementById(
        'memberModalClose'
      )
      ?.addEventListener(
        'click',
        closeModal
      );


    modal?.addEventListener(
      'click',
      event => {

        if(event.target === modal){
          closeModal();
        }

      }
    );


    document.addEventListener(
      'keydown',
      event => {

        if(
          event.key === 'Escape' &&
          modal?.classList.contains(
            'open'
          )
        ){
          closeModal();
        }

      }
    );


    const bindCards = () => {

      root
        .querySelectorAll(
          '.member-card'
        )
        .forEach(
          card => {

            const index =
              Number(
                card.dataset.memberIndex
              );


            const member =
              Number.isInteger(index)
                ? data[index]
                : null;


            if(!member){
              return;
            }


            card.addEventListener(
              'click',
              () =>
                openModal(member)
            );


            card.addEventListener(
              'keydown',
              event => {

                if(
                  event.key === 'Enter' ||
                  event.key === ' '
                ){

                  event.preventDefault();

                  openModal(member);

                }

              }
            );


            card
              .querySelectorAll(
                '[data-copy-email]'
              )
              .forEach(
                button =>
                  button.addEventListener(
                    'click',
                    event => {

                      event.stopPropagation();

                      copyEmail(
                        member.email
                      );

                    }
                  )
              );

          }
        );

    };


    const render = filter => {

      root.classList.add(
        'visible'
      );


      const subset =
        filter === 'all'
          ? data
          : data.filter(
              member =>
                member.role_group ===
                filter
            );


      if(!subset.length){

        root.innerHTML =
          empty(
            '등록된 구성원 정보가 없습니다.'
          );

        return;

      }


      root.innerHTML =
        order
          .filter(
            role =>
              subset.some(
                member =>
                  member.role_group ===
                  role
              )
          )
          .map(
            role => {

              const rows =
                subset.filter(
                  member =>
                    member.role_group ===
                    role
                );


              return `

                <div class="section-title-row">

                  <h3>
                    ${labels[role]}
                  </h3>

                  <span class="count">
                    ${rows.length}
                  </span>

                </div>


                <div class="member-grid">

                  ${rows
                    .map(
                      member => `

                        <article
                          class="member-card glass"
                          tabindex="0"
                          role="button"
                          aria-label="${esc(
                            member.name_ko ||
                            member.name_en ||
                            'Member'
                          )} 프로필 보기"
                          data-member-index="${
                            data.indexOf(member)
                          }"
                          data-role="${esc(
                            member.role_group
                          )}"
                        >

                          <div
                            class="member-photo ${
                              member.photo
                                ? 'has-photo'
                                : ''
                            }"
                            ${
                              member.photo
                                ? `style="
                                    background-image:
                                      linear-gradient(
                                        180deg,
                                        rgba(7,95,130,.04),
                                        rgba(7,95,130,.14)
                                      ),
                                      url('${asset(member.photo)}');
                                    background-size:cover;
                                    background-position:center top;
                                  "`
                                : ''
                            }
                          >

                            ${
                              member.photo
                                ? ''
                                : 'PROFILE IMAGE'
                            }

                          </div>


                          <div class="member-info">

                            <h3>
                              ${esc(
                                member.name_ko ||
                                member.name_en ||
                                'Member'
                              )}
                            </h3>

                            ${
                              member.name_en &&
                              member.name_ko
                                ? `
                                  <div
                                    style="
                                      font-size:11px;
                                      color:var(--muted);
                                      margin-top:2px;
                                    "
                                  >
                                    ${esc(
                                      member.name_en
                                    )}
                                  </div>
                                `
                                : ''
                            }

                            <div class="degree">
                              ${esc(
                                member.role_label ||
                                ''
                              )}
                            </div>

                            <p>
                              ${
                                member.research_interests
                                  ? `Research Interests · ${esc(
                                      member.research_interests
                                    )}`
                                  : ''
                              }
                            </p>

                            <div class="member-links">

                              ${
                                member.email
                                  ? `
                                    <button
                                      type="button"
                                      data-copy-email
                                    >
                                      EMAIL COPY
                                    </button>
                                  `
                                  : ''
                              }

                              ${
                                member.profile_url
                                  ? `
                                    <a
                                      href="${safeLink(
                                        member.profile_url
                                      )}"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onclick="event.stopPropagation()"
                                    >
                                      PROFILE ↗
                                    </a>
                                  `
                                  : ''
                              }

                            </div>

                          </div>

                        </article>

                      `
                    )
                    .join('')
                  }

                </div>

              `;

            }
          )
          .join('');


      bindCards();

    };


    filters.forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            filters.forEach(
              item =>
                item.classList.remove(
                  'active'
                )
            );


            button.classList.add(
              'active'
            );


            render(
              button.dataset.filter ||
              'all'
            );

          }
        );

      }
    );


    render('all');

  }



  /* =========================================================
     ALUMNI
  ========================================================= */

  async function initAlumni(){

    const raw =
      await load('alumni');


    const data =
      asArray(
        raw,
        'alumni',
        'Alumni'
      )
      .filter(isVisibleRow);


    const archive =
      document.getElementById(
        'archive'
      );


    if(!archive){
      return;
    }


    archive.classList.add(
      'visible'
    );


    const search =
      document.getElementById(
        'alumniSearch'
      );


    const degree =
      document.getElementById(
        'degreeFilter'
      );


    const decadeSelect =
      document.getElementById(
        'decadeSelect'
      );


    const decadeButtons =
      document.querySelector(
        '.decades'
      );


    if(
      !search ||
      !degree ||
      !decadeSelect ||
      !decadeButtons
    ){
      return;
    }


    const degreeValues =
      [
        ...new Set(
          data
            .map(
              item =>
                item.degree
            )
            .filter(Boolean)
        )
      ]
      .sort();


    degree.innerHTML =
      '<option value="all">ALL DEGREES</option>' +
      degreeValues
        .map(
          value =>
            `<option value="${esc(value)}">${esc(value)}</option>`
        )
        .join('');


    const decades =
      [
        ...new Set(
          data
            .map(
              item =>
                Math.floor(
                  Number(
                    item.graduation_year
                  ) / 10
                ) * 10
            )
            .filter(Boolean)
        )
      ]
      .sort(
        (a,b) =>
          b - a
      );


    decadeSelect.innerHTML =
      '<option value="all">ALL DECADES</option>' +
      decades
        .map(
          value =>
            `<option value="${value}s">${value}s</option>`
        )
        .join('');


    decadeButtons.innerHTML =
      '<button class="decade-btn active" data-decade="all" type="button">ALL</button>' +
      decades
        .map(
          value =>
            `<button class="decade-btn" data-decade="${value}s" type="button">${value}s</button>`
        )
        .join('');


    let selectedDecade =
      'all';


    const render = () => {

      const query =
        String(
          search.value || ''
        )
        .trim()
        .toLowerCase();


      const selectedDegree =
        degree.value;


      const decade =
        decadeSelect.value !==
        'all'
          ? decadeSelect.value
          : selectedDecade;


      const rows =
        data.filter(
          item => {

            const text =
              [
                item.name_ko,
                item.name_en,
                item.affiliation,
                item.position,
                item.note
              ]
              .join(' ')
              .toLowerCase();


            const itemDecade =
              `${Math.floor(
                Number(
                  item.graduation_year
                ) / 10
              ) * 10}s`;


            return (
              (
                !query ||
                text.includes(query)
              ) &&
              (
                selectedDegree ===
                  'all' ||
                item.degree ===
                  selectedDegree
              ) &&
              (
                decade === 'all' ||
                itemDecade ===
                  decade
              )
            );

          }
        );


      if(!rows.length){

        archive.innerHTML =
          `
            <div
              class="no-results"
              style="display:block"
            >
              조건에 맞는 Alumni가 없습니다.
            </div>
          `;

        return;

      }


      const groups = {};


      rows.forEach(
        item => {

          const decade =
            `${Math.floor(
              Number(
                item.graduation_year
              ) / 10
            ) * 10}s`;


          groups[decade] ??= {};


          groups[decade][
            item.graduation_year
          ] ??= [];


          groups[decade][
            item.graduation_year
          ].push(item);

        }
      );


      archive.innerHTML =
        Object
          .keys(groups)
          .sort(
            (a,b) =>
              parseInt(b,10) -
              parseInt(a,10)
          )
          .map(
            decade => `

              <div class="decade-block">

                <h3 class="decade-title">
                  ${decade}
                </h3>

                ${Object
                  .keys(
                    groups[decade]
                  )
                  .sort(
                    (a,b) =>
                      Number(b) -
                      Number(a)
                  )
                  .map(
                    year => `

                      <div class="year-group">

                        <div class="year-label">
                          ${year}
                        </div>

                        <div class="alumni-list">

                          ${groups[decade][year]
                            .map(
                              item => `

                                <div class="alumni-row">

                                  <b>
                                    ${esc(
                                      item.name_ko ||
                                      item.name_en ||
                                      'Alumni'
                                    )}
                                  </b>

                                  <span class="degree">
                                    ${esc(
                                      item.degree ||
                                      ''
                                    )}
                                  </span>

                                  <span class="position">
                                    ${esc(
                                      [
                                        item.affiliation,
                                        item.position
                                      ]
                                      .filter(Boolean)
                                      .join(' · ')
                                    )}
                                  </span>

                                  <span class="arrow">
                                    ↗
                                  </span>

                                </div>

                              `
                            )
                            .join('')
                          }

                        </div>

                      </div>

                    `
                  )
                  .join('')
                }

              </div>

            `
          )
          .join('');

    };


    search.addEventListener(
      'input',
      render
    );


    degree.addEventListener(
      'change',
      render
    );


    decadeSelect.addEventListener(
      'change',
      render
    );


    decadeButtons.addEventListener(
      'click',
      event => {

        const button =
          event.target.closest(
            '.decade-btn'
          );


        if(!button){
          return;
        }


        decadeButtons
          .querySelectorAll(
            '.decade-btn'
          )
          .forEach(
            item =>
              item.classList.remove(
                'active'
              )
          );


        button.classList.add(
          'active'
        );


        selectedDecade =
          button.dataset.decade ||
          'all';


        decadeSelect.value =
          'all';


        render();

      }
    );


    render();

  }



  /* =========================================================
     PUBLICATIONS
  ========================================================= */

  const normalizePublicationType =
    value => {

      const type =
        String(value || '')
          .trim()
          .toLowerCase();


      if(
        type === 'journal' ||
        type === 'journal article' ||
        type === 'article'
      ){
        return 'journal';
      }


      if(type === 'book'){
        return 'book';
      }


      if(
        type === 'chapter' ||
        type === 'book chapter' ||
        type === 'bookchapter'
      ){
        return 'chapter';
      }


      if(
        type === 'report' ||
        type === 'research report'
      ){
        return 'report';
      }


      return type;

    };


  const normalizePublication =
    source => {

      return {

        active:
          pick(
            source,
            'active',
            'Active'
          ),

        id:
          pick(
            source,
            'id',
            'ID',
            'Id'
          ),

        featured:
          pick(
            source,
            'featured',
            'Featured'
          ),

        year:
          String(
            pick(
              source,
              'year',
              'Year'
            ) || ''
          )
          .replace(
            /\.0$/,
            ''
          ),

        type:
          normalizePublicationType(
            pick(
              source,
              'type',
              'Type'
            )
          ),

        title:
          pick(
            source,
            'title',
            'Title'
          ),

        authors:
          pick(
            source,
            'authors',
            'Authors'
          ),

        venue:
          pick(
            source,
            'venue',
            'Venue'
          ),

        volume_issue:
          pick(
            source,
            'volume_issue',
            'Volume_Issue',
            'Volume Issue',
            'volumeIssue'
          ),

        doi_url:
          pick(
            source,
            'doi_url',
            'DOI_URL',
            'DoiUrl',
            'doi'
          ),

        pdf_url:
          pick(
            source,
            'pdf_url',
            'PDF_URL',
            'PdfUrl',
            'pdf'
          ),

        keywords:
          pick(
            source,
            'keywords',
            'Keywords'
          )

      };

    };


  async function initPublications(){

    const raw =
      await load(
        'publications'
      );


    const originalRows =
      asArray(
        raw,
        'publications',
        'Publications'
      );


    const data =
      originalRows
        .filter(isVisibleRow)
        .map(
          normalizePublication
        );


    const stats =
      document.querySelectorAll(
        '.hero-stat-card .stat strong'
      );


    const search =
      document.getElementById(
        'searchInput'
      );


    const year =
      document.getElementById(
        'yearSelect'
      );


    const sort =
      document.getElementById(
        'sortSelect'
      );


    const archive =
      document.getElementById(
        'publicationArchive'
      );


    const resultCount =
      document.getElementById(
        'resultCount'
      );


    const noResults =
      document.getElementById(
        'noResults'
      );


    const filters =
      [
        ...document.querySelectorAll(
          '.filter-row .filter'
        )
      ];


    /*
      현재 Publications 페이지에 실제 존재하는
      요소만 사용합니다.

      .featured-grid
      .book-grid

      는 더 이상 사용하지 않습니다.
    */

    if(
      !search ||
      !year ||
      !sort ||
      !archive ||
      !resultCount ||
      !noResults
    ){

      console.warn(
        'KEE LAB: Publications page elements are missing.'
      );

      return;

    }


    /* =====================================================
       HERO STATISTICS
    ====================================================== */

    if(stats.length >= 4){

      stats[0].textContent =
        data.length;


      stats[1].textContent =
        data.filter(
          item =>
            item.type ===
            'journal'
        ).length;


      stats[2].textContent =
        data.filter(
          item =>
            item.type ===
              'book' ||
            item.type ===
              'chapter'
        ).length;


      const publicationYears =
        data
          .map(
            item =>
              Number(
                item.year
              )
          )
          .filter(
            value =>
              Number.isFinite(value) &&
              value > 0
          );


      if(publicationYears.length){

        const earliest =
          Math.min(
            ...publicationYears
          );


        const latest =
          Math.max(
            ...publicationYears
          );


        stats[3].textContent =
          latest - earliest + 1;

      }else{

        stats[3].textContent =
          '—';

      }

    }


    /* =====================================================
       FETCH ERROR
    ====================================================== */

    if(
      loadFailures.has(
        'publications'
      )
    ){

      resultCount.textContent =
        '0';


      archive.classList.add(
        'visible'
      );


      archive.innerHTML =
        `
          <div class="data-empty glass">

            <b>
              연구성과 데이터를 불러오지 못했습니다.
            </b>

            <span>
              데이터 파일 경로와 배포 상태를 확인해 주세요.
            </span>

          </div>
        `;


      noResults.style.display =
        'none';


      return;

    }


    /* =====================================================
       EMPTY JSON
    ====================================================== */

    if(!data.length){

      console.warn(
        'KEE LAB: publications.json is empty.'
      );


      resultCount.textContent =
        '0';


      archive.classList.add(
        'visible'
      );


      archive.innerHTML =
        `
          <div class="data-empty glass">

            <b>
              등록된 연구성과가 없습니다.
            </b>

          </div>
        `;


      noResults.style.display =
        'none';


      return;

    }


    /* =====================================================
       YEAR OPTIONS
    ====================================================== */

    const years =
      [
        ...new Set(
          data
            .map(
              item =>
                String(
                  item.year || ''
                )
            )
            .filter(Boolean)
        )
      ]
      .sort(
        (a,b) =>
          Number(b) -
          Number(a)
      );


    year.innerHTML =
      '<option value="all">전체 연도</option>' +
      years
        .map(
          value =>
            `<option value="${esc(value)}">${esc(value)}</option>`
        )
        .join('');


    let activeType =
      'all';


    /* =====================================================
       RENDER
    ====================================================== */

    const render = () => {

      const query =
        String(
          search.value || ''
        )
        .trim()
        .toLowerCase();


      const selectedYear =
        year.value;


      let rows =
        data.filter(
          publication => {

            const searchable =
              [
                publication.title,
                publication.authors,
                publication.venue,
                publication.volume_issue,
                publication.keywords,
                publication.type,
                publication.year
              ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();


            const matchesSearch =
              !query ||
              searchable.includes(
                query
              );


            const matchesYear =
              selectedYear ===
                'all' ||
              String(
                publication.year
              ) ===
                selectedYear;


            const matchesType =
              activeType ===
                'all' ||
              publication.type ===
                activeType;


            return (
              matchesSearch &&
              matchesYear &&
              matchesType
            );

          }
        );


      rows.sort(
        (a,b) => {

          const aYear =
            Number(a.year) || 0;


          const bYear =
            Number(b.year) || 0;


          if(sort.value === 'old'){

            if(aYear !== bYear){
              return aYear - bYear;
            }

          }else{

            if(aYear !== bYear){
              return bYear - aYear;
            }

          }


          return String(
            a.title || ''
          )
          .localeCompare(
            String(
              b.title || ''
            ),
            'ko'
          );

        }
      );


      resultCount.textContent =
        rows.length;


      archive.classList.add(
        'visible'
      );


      if(!rows.length){

        archive.innerHTML =
          '';


        noResults.style.display =
          'block';


        return;

      }


      noResults.style.display =
        'none';


      const groups = {};


      rows.forEach(
        publication => {

          const publicationYear =
            String(
              publication.year ||
              '연도 미상'
            );


          groups[
            publicationYear
          ] ??= [];


          groups[
            publicationYear
          ].push(
            publication
          );

        }
      );


      const orderedYears =
        Object
          .keys(groups)
          .sort(
            (a,b) => {

              const aYear =
                Number(a) || 0;


              const bYear =
                Number(b) || 0;


              return (
                sort.value ===
                  'old'
                  ? aYear - bYear
                  : bYear - aYear
              );

            }
          );


      archive.innerHTML =
        orderedYears
          .map(
            publicationYear => {

              const publications =
                groups[
                  publicationYear
                ];


              return `

                <section class="year-block">

                  <h3 class="year-title">

                    ${esc(
                      publicationYear
                    )}

                    <span class="count">
                      ${publications.length}
                      ITEMS
                    </span>

                  </h3>


                  <div class="pub-list">

                    ${publications
                      .map(
                        (
                          publication,
                          index
                        ) => {

                          const keywords =
                            String(
                              publication.keywords ||
                              ''
                            )
                            .split(
                              /[;,|]/
                            )
                            .map(
                              value =>
                                value.trim()
                            )
                            .filter(Boolean)
                            .slice(0,4);


                          const citation =
                            [
                              publication.authors,
                              publication.year
                                ? `(${publication.year})`
                                : '',
                              publication.title,
                              publication.venue
                            ]
                            .filter(Boolean)
                            .join('. ');


                          return `

                            <article class="pub-row">


                              <div class="pub-index">

                                ${String(
                                  index + 1
                                ).padStart(
                                  2,
                                  '0'
                                )}

                              </div>


                              <div class="pub-main">


                                <h3>
                                  ${esc(
                                    publication.title ||
                                    ''
                                  )}
                                </h3>


                                ${
                                  publication.authors
                                    ? `
                                      <div class="authors">
                                        ${esc(
                                          publication.authors
                                        )}
                                      </div>
                                    `
                                    : ''
                                }


                                ${
                                  publication.venue ||
                                  publication.volume_issue
                                    ? `
                                      <div class="venue">

                                        ${esc(
                                          [
                                            publication.venue,
                                            publication.volume_issue
                                          ]
                                          .filter(Boolean)
                                          .join(' · ')
                                        )}

                                      </div>
                                    `
                                    : ''
                                }


                                ${
                                  keywords.length
                                    ? `
                                      <div class="badges">

                                        ${keywords
                                          .map(
                                            keyword =>
                                              `<span class="badge">${esc(
                                                String(
                                                  keyword
                                                )
                                                .toUpperCase()
                                              )}</span>`
                                          )
                                          .join('')
                                        }

                                      </div>
                                    `
                                    : ''
                                }


                              </div>


                              <div class="pub-actions">


                                ${
                                  publication.doi_url
                                    ? `
                                      <a
                                        class="icon-btn"
                                        href="${safeLink(
                                          publication.doi_url
                                        )}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        DOI ↗
                                      </a>
                                    `
                                    : ''
                                }


                                ${
                                  publication.pdf_url
                                    ? `
                                      <a
                                        class="icon-btn"
                                        href="${safeLink(
                                          publication.pdf_url
                                        )}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        PDF
                                      </a>
                                    `
                                    : ''
                                }


                                <button
                                  class="icon-btn cite-dynamic"
                                  type="button"
                                  data-cite="${esc(
                                    citation
                                  )}"
                                >
                                  CITE
                                </button>


                              </div>


                            </article>

                          `;

                        }
                      )
                      .join('')
                    }

                  </div>

                </section>

              `;

            }
          )
          .join('');

    };


    /* =====================================================
       EVENTS
    ====================================================== */

    search.addEventListener(
      'input',
      render
    );


    year.addEventListener(
      'change',
      render
    );


    sort.addEventListener(
      'change',
      render
    );


    filters.forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            filters.forEach(
              item =>
                item.classList.remove(
                  'active'
                )
            );


            button.classList.add(
              'active'
            );


            activeType =
              String(
                button.dataset.type ||
                'all'
              )
              .toLowerCase();


            render();

          }
        );

      }
    );


    document.addEventListener(
      'click',
      async event => {

        const button =
          event.target.closest(
            '.cite-dynamic'
          );


        if(!button){
          return;
        }


        const citation =
          button.dataset.cite ||
          '';


        const originalText =
          button.textContent;


        try{

          if(
            navigator.clipboard &&
            window.isSecureContext
          ){

            await navigator
              .clipboard
              .writeText(
                citation
              );


            button.textContent =
              'COPIED';


            setTimeout(
              () => {

                button.textContent =
                  originalText;

              },
              1000
            );


            return;

          }


          throw new Error(
            'Clipboard unavailable'
          );


        }catch(error){

          window.prompt(
            'Citation',
            citation
          );

        }

      }
    );


    render();

  }



  /* =========================================================
     NEWS
  ========================================================= */

  async function initNews(){

    const raw =
      await load('news');


    const data =
      asArray(
        raw,
        'news',
        'News'
      )
      .filter(isVisibleRow);


    const search =
      document.getElementById(
        'newsSearch'
      );


    const year =
      document.getElementById(
        'yearFilter'
      );


    const grid =
      document.getElementById(
        'newsGrid'
      );


    const noResults =
      document.getElementById(
        'noResults'
      );


    const filters =
      [
        ...document.querySelectorAll(
          '.filter-row .filter'
        )
      ];


    if(
      !search ||
      !year ||
      !grid ||
      !noResults
    ){
      return;
    }


    const years =
      [
        ...new Set(
          data
            .map(
              item =>
                yearOf(item.date)
            )
            .filter(Boolean)
        )
      ]
      .sort(
        (a,b) =>
          Number(b) -
          Number(a)
      );


    year.innerHTML =
      '<option value="all">전체 연도</option>' +
      years
        .map(
          value =>
            `<option value="${esc(value)}">${esc(value)}</option>`
        )
        .join('');


    let active =
      'all';


    const render = () => {

      const query =
        String(
          search.value || ''
        )
        .trim()
        .toLowerCase();


      const selectedYear =
        year.value;


      const rows =
        data.filter(
          item => {

            const searchable =
              [
                item.title,
                item.summary,
                item.body,
                item.category
              ]
              .join(' ')
              .toLowerCase();


            return (
              (
                !query ||
                searchable.includes(
                  query
                )
              ) &&
              (
                selectedYear ===
                  'all' ||
                yearOf(
                  item.date
                ) ===
                  selectedYear
              ) &&
              (
                active ===
                  'all' ||
                item.category ===
                  active
              )
            );

          }
        );


      grid.classList.add(
        'visible'
      );


      if(!rows.length){

        grid.innerHTML =
          '';


        noResults.style.display =
          'block';


        return;

      }


      noResults.style.display =
        'none';


      grid.innerHTML =
        rows
          .map(
            item => `

              <article class="news-card glass">

                <div
                  class="news-media"
                  ${imgStyle(
                    item.image
                  )}
                >

                  <span class="news-category">
                    ${esc(
                      String(
                        item.category ||
                        'news'
                      )
                      .toUpperCase()
                    )}
                  </span>

                </div>


                <div class="news-body">

                  <div class="news-date">
                    ${fmtDate(
                      item.date
                    )}
                  </div>

                  <h3>
                    ${esc(
                      item.title
                    )}
                  </h3>

                  <p>
                    ${esc(
                      item.summary ||
                      ''
                    )}
                  </p>

                  <div class="news-bottom">

                    ${
                      item.link_url
                        ? `
                          <a
                            class="readmore"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="${safeLink(
                              item.link_url
                            )}"
                          >
                            READ STORY ↗
                          </a>
                        `
                        : `
                          <span class="readmore">
                            KEE LAB UPDATE
                          </span>
                        `
                    }

                    <span class="tag">
                      ${esc(
                        String(
                          item.category ||
                          'news'
                        )
                        .toUpperCase()
                      )}
                    </span>

                  </div>

                </div>

              </article>

            `
          )
          .join('');

    };


    search.addEventListener(
      'input',
      render
    );


    year.addEventListener(
      'change',
      render
    );


    filters.forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            filters.forEach(
              item =>
                item.classList.remove(
                  'active'
                )
            );


            button.classList.add(
              'active'
            );


            active =
              button.dataset.category ||
              'all';


            render();

          }
        );

      }
    );


    render();

  }



  /* =========================================================
     GALLERY
  ========================================================= */

  async function initGallery(){

    const raw =
      await load('gallery');


    const data =
      asArray(
        raw,
        'gallery',
        'Gallery'
      )
      .filter(isVisibleRow);


    const heroPhotos =
      [
        ...document.querySelectorAll(
          '.hero-photo'
        )
      ];


    data
      .slice(0,3)
      .forEach(
        (
          photo,
          index
        ) => {

          if(
            heroPhotos[index] &&
            photo.image
          ){

            heroPhotos[
              index
            ].style.backgroundImage =
              `url('${asset(photo.image)}')`;


            heroPhotos[
              index
            ].style.backgroundSize =
              'cover';


            heroPhotos[
              index
            ].style.backgroundPosition =
              'center';

          }

        }
      );


    const search =
      document.getElementById(
        'gallerySearch'
      );


    const year =
      document.getElementById(
        'yearFilter'
      );


    const grid =
      document.getElementById(
        'galleryGrid'
      );


    const noResults =
      document.getElementById(
        'noResults'
      );


    const filters =
      [
        ...document.querySelectorAll(
          '.filter-row .filter'
        )
      ];


    if(
      !search ||
      !year ||
      !grid ||
      !noResults
    ){
      return;
    }


    const years =
      [
        ...new Set(
          data
            .map(
              item =>
                yearOf(item.date)
            )
            .filter(Boolean)
        )
      ]
      .sort(
        (a,b) =>
          Number(b) -
          Number(a)
      );


    year.innerHTML =
      '<option value="all">ALL YEARS</option>' +
      years
        .map(
          value =>
            `<option value="${esc(value)}">${esc(value)}</option>`
        )
        .join('');


    let active =
      'all';


    const patterns = [
      'tall',
      'medium',
      'medium',
      'wide',
      'medium',
      'tall',
      'medium',
      'medium'
    ];


    const bindLightbox = () => {

      const lightbox =
        document.getElementById(
          'lightbox'
        );


      const title =
        document.getElementById(
          'lightboxTitle'
        );


      const date =
        document.getElementById(
          'lightboxDate'
        );


      const image =
        lightbox?.querySelector(
          '.lightbox-image'
        );


      const copy =
        lightbox?.querySelector(
          '.lightbox-copy p'
        );


      grid
        .querySelectorAll(
          '.photo-card'
        )
        .forEach(
          card => {

            card.addEventListener(
              'click',
              () => {

                const photo =
                  data.find(
                    item =>
                      String(item.id) ===
                      card.dataset.id
                  );


                if(
                  !photo ||
                  !lightbox
                ){
                  return;
                }


                if(title){

                  title.textContent =
                    photo.title ||
                    'Gallery Photo';

                }


                if(date){

                  date.textContent =
                    fmtDate(
                      photo.date
                    );

                }


                if(copy){

                  copy.textContent =
                    photo.caption ||
                    '';

                }


                if(
                  image &&
                  photo.image
                ){

                  image.style.backgroundImage =
                    `url('${asset(photo.image)}')`;


                  image.style.backgroundSize =
                    'cover';


                  image.style.backgroundPosition =
                    'center';

                }


                lightbox.classList.add(
                  'open'
                );


                lightbox.setAttribute(
                  'aria-hidden',
                  'false'
                );

              }
            );

          }
        );

    };


    const render = () => {

      const query =
        String(
          search.value || ''
        )
        .trim()
        .toLowerCase();


      const selectedYear =
        year.value;


      const rows =
        data.filter(
          photo => {

            const searchable =
              [
                photo.title,
                photo.caption,
                photo.album,
                photo.category
              ]
              .join(' ')
              .toLowerCase();


            return (
              (
                !query ||
                searchable.includes(
                  query
                )
              ) &&
              (
                selectedYear ===
                  'all' ||
                yearOf(
                  photo.date
                ) ===
                  selectedYear
              ) &&
              (
                active ===
                  'all' ||
                photo.category ===
                  active
              )
            );

          }
        );


      if(!rows.length){

        grid.innerHTML =
          '';


        noResults.style.display =
          'block';


        return;

      }


      noResults.style.display =
        'none';


      grid.innerHTML =
        rows
          .map(
            (
              photo,
              index
            ) => `

              <article
                class="photo-card ${
                  patterns[
                    index %
                    patterns.length
                  ]
                }"
                data-id="${esc(
                  photo.id
                )}"
                ${imgStyle(
                  photo.image
                )}
              >

                <span class="photo-open">
                  ＋
                </span>

                <div class="photo-info">

                  <small>
                    ${fmtDate(
                      photo.date,
                      'month'
                    )}
                  </small>

                  <b>
                    ${esc(
                      photo.title
                    )}
                  </b>

                </div>

              </article>

            `
          )
          .join('');


      bindLightbox();

    };


    search.addEventListener(
      'input',
      render
    );


    year.addEventListener(
      'change',
      render
    );


    filters.forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            filters.forEach(
              item =>
                item.classList.remove(
                  'active'
                )
            );


            button.classList.add(
              'active'
            );


            active =
              button.dataset.category ||
              'all';


            render();

          }
        );

      }
    );


    render();


    const lightbox =
      document.getElementById(
        'lightbox'
      );


    const closeLightbox = () => {

      lightbox?.classList.remove(
        'open'
      );


      lightbox?.setAttribute(
        'aria-hidden',
        'true'
      );

    };


    document
      .getElementById(
        'closeLightbox'
      )
      ?.addEventListener(
        'click',
        closeLightbox
      );


    lightbox?.addEventListener(
      'click',
      event => {

        if(
          event.target ===
          lightbox
        ){
          closeLightbox();
        }

      }
    );


    document.addEventListener(
      'keydown',
      event => {

        if(event.key === 'Escape'){
          closeLightbox();
        }

      }
    );

  }



  /* =========================================================
     PAGE INITIALIZER
  ========================================================= */

  const initPage = () => {

    if(page === 'home'){
      initHome();
    }


    if(page === 'professor'){
      initProfessor();
    }


    if(page === 'members'){
      initMembers();
    }


    if(page === 'alumni'){
      initAlumni();
    }


    if(page === 'publications'){
      initPublications();
    }


    if(page === 'news'){
      initNews();
    }


    if(page === 'gallery'){
      initGallery();
    }

  };


  if(
    document.readyState ===
    'loading'
  ){

    document.addEventListener(
      'DOMContentLoaded',
      initPage,
      {
        once:true
      }
    );

  }else{

    initPage();

  }

})();