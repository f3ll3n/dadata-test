class SuggestionsForm extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    //HTML Template
    this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="styles.css">
        <section class="container">
	        <p><strong>Компания или ИП</strong></p>
	        <input id="party" name="party" type="text" placeholder="Введите название, ИНН, ОГРН или адрес организации" />
	        <ul id="suggestions-wrapper"></ul>  
        </section>
        <section class="result">
            <p id="type"></p>
            <div class="row">
                <label>Краткое наименование</label>
                <input id="name_short">
            </div>
            <div class="row">
                <label>Полное наименование</label>
                <input id="name_full">
            </div>
            <div class="row">
                <label>ИНН / КПП</label>
                <input id="inn_kpp">
            </div>
            <div class="row">
                <label>Адрес</label>
                <input id="address">
            </div>
        </section>
    `;

    //Links to input elements
    this.suggestionsWrapper = this.shadowRoot.getElementById(
      'suggestions-wrapper'
    );
    this.nameInput = this.shadowRoot.getElementById('party');
    this.nameShort = this.shadowRoot.getElementById('name_short');
    this.nameFull = this.shadowRoot.getElementById('name_full');
    this.inn = this.shadowRoot.getElementById('inn_kpp');
    this.address = this.shadowRoot.getElementById('address');

    //Options for work with API
    this.url =
      'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party';
    this.token = '492b81983ecbb026009b7298d7756d8b830b4dbe';
    this.options = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Token ' + this.token,
      },
    };
 
    //Query to daData API
    this.nameInput.addEventListener('input', async (event) => {
      const response = await fetch(this.url, {
        ...this.options,
        body: JSON.stringify({ query: event.target.value, count: 5 }),
      });
      if (response.ok) {
        const data = await response.json();
        this.deleteSuggestions();

        if (!data.suggestions.length && this.nameInput.value) {
          this.deleteSuggestions();
          const listItem = document.createElement('li');
          listItem.classList.add('suggestion');
          listItem.innerText = 'Неизвестная организация';
          this.suggestionsWrapper.appendChild(listItem);
        }

        data.suggestions.forEach((val) => {
          const listItem = document.createElement('li');
          listItem.classList.add('suggestion');
          const paragraphHTML = document.createElement('p');
          paragraphHTML.innerText = val.value;
          paragraphHTML.classList.add('suggestion-name');
          const spanHTML = document.createElement('span');
          spanHTML.classList.add('suggestion-info')
          spanHTML.innerText = `${val.data.inn}  ${val.data.address.value}`;
          listItem.appendChild(paragraphHTML);
          listItem.appendChild(spanHTML);
          this.suggestionsWrapper.appendChild(listItem);

          listItem.addEventListener('click', () => this.setInputsValue(val));
        });
      }
    });

    this.setInputsValue = (val) => {
        this.deleteSuggestions();
        this.nameInput.value = val.value;
        this.inn.value = val.data.inn + ' / ' + val.data.kpp;
        this.nameFull.value = val.data.name.full_with_opf;
        this.nameShort.value = val.data.name.short_with_opf;
        this.address.value = val.data.address.value;
    };

       //Delete all child elements before render new

    this.deleteSuggestions = () => {
        let childElements =
          this.suggestionsWrapper.querySelectorAll('.suggestion');
        childElements.forEach((child) => {
           this.suggestionsWrapper.removeChild(child);
         });
    };
  }
}

customElements.define('suggestions-form', SuggestionsForm);
