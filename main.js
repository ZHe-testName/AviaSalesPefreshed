'use strict'

//получаем инпуты и списки
const formSearch = document.querySelector('.form-search'),
    inputCitiesFrom = document.querySelector('.input__cities-from'),
    dropdownCitiesFrom = document.querySelector('.dropdown__cities-from'),
    inputCitiesTo = document.querySelector('.input__cities-to'),
    dropdownCitiesTo = document.querySelector('.dropdown__cities-to'),
    inputDateDepart = document.querySelector('.input__date-depart'),
    chipestTicket = document.getElementById('cheapest-ticket'),
    otherCheapTickets = document.getElementById('other-cheap-tickets'),
    modal = document.querySelector('.modal'),
    modalClose = document.querySelector('.modal-close'),
    overlayModal = document.querySelector('.overlay-modal'),
    modalTitle = document.querySelector('.modal__title');


//массив возможных городов
let city = [];

//const cityesApi = 'http://api.travelpayouts.com/data/ru/cities.json';

const CITIES_API = 'data base/cityes.json';

const PROXY = 'https://cors-anywhere.herokuapp.com/';

const API_KEY = 'fe97c4abc71297b7ea093a47d516bdfb';

const CALENDAR = 'https://min-prices.aviasales.ru/calendar_preload';

const MAX_COUNT = 5;

//функция для илюстрации выпадающего списка городов
const showCity = (input, list, event) => {
    //каждый раз очищаем выпадающий список
    list.textContent = '';

    //если инпут пуст прекращаем работу функции
    if(input.value === ''){
        return;
    };
    
    //создаем массив из городов в массиве city название которых начинается
    //на введеное в инпут значение
    const filterCity1 = city.filter((item) => {
            const fixItem = item.name.toLowerCase();
            //отрезаем часть названия равную длинне введенного в инпут значения
            const trim = fixItem.slice(0, event.target.value.length);
            //сравниваем со значением в инпут
            if(trim === input.value.toLowerCase()){
                return true;
            };
            //return fixItem.includes(input.value.toLowerCase());
    });

    //алгоритм сортировки названий городов в алфавитном порядке
    const filterCity = filterCity1.sort((a, b) => {
        //для оптимизации в i присвоено значение длинны инпута
        for(let i = event.target.value.length; i < a.name.length; i++){
            if(a.name[i] < b.name[i]){
                return -1;
            }if(a.name[i] > b.name[i]){
                return 1;
            };
            
        };
    });
    
    //создаем елемент выпадающего списка для каждого елемента массива filterCity
    filterCity.forEach((item) => {
        const li = document.createElement('li');
        li.classList.add('dropdowm__city');
        li.textContent = item.name;
        list.append(li);
    });
};

//функция для обработки клика по городу из списка
const hendlerCity = (event, input, list) => {
    const target = event.target;
    if(target.tagName.toLowerCase() === 'li'){
        input.value = target.textContent;
        list.textContent = '';
    };
};

//функция для открития модальных окон
const modalOpenFunc = (str) => {
    overlayModal.classList.add('active');
    modal.classList.add('active');
    modalTitle.innerHTML = str;
};

//функция для закрития модального окна
const modalCloseFunc = () => {
    modal.classList.remove('active');
    overlayModal.classList.remove('active');
};

//функция обращения к базе данных городов
//на сервере
const getData = (url, callback, reject = console.error) => {
    //создаем обект запроса
    const request = new XMLHttpRequest();

    request.open('GET', url);

    //слушатель когда прийдет ответ с сервера
    //4-ка означает что ответ пришел
    request.addEventListener('readystatechange', () => {
        if(request.readyState !== 4){
            return;
        }

        //статус 200 означает что все хорошо
        if(request.status === 200){
            callback(request.response);
        }else{
            reject(request.status);
        }
    });

    request.send();
};

//функция обращения к API авиакомпании на наличие билетов
const getPrice = (url, callback) => {
    const requestToPrice = new XMLHttpRequest();

    requestToPrice.open('GET', url);

    requestToPrice.addEventListener('readystatechange', () => {
        if(requestToPrice.readyState !== 4){
            return;
        };

        if(requestToPrice.status === 200){
            callback(requestToPrice.response);
        }else{
            console.error(requestToPrice.status);
        };
    });

    requestToPrice.send();

};

//формирование стоки запроса по клику на кнопку "Купить"
const getAirLink = data => {
    //пример строки запроса
    //https://www.aviasales.ru/search/SVX2905KGD1
    let link = 'https://www.aviasales.ru/search/';
    let from = data.origin;

    link += from;

    let when = new Date(data.depart_date);
    let day = when.getDate();

    link += day < 10 ? '0' + day : day;

    let month = when.getMonth() + 1;
    
    link += month < 10 ? '0' + month : month;

    let to = data.destination;

    link += to;
    
    return link + '1';
};

//формировка даты
const getDate = date => {
    return new Date(date).toLocaleString('ru', {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

//имя города по коду
const getNameCity = code => {
    const cityObj = city.find(item => item.code === code);
    return cityObj.name;
};

//количество пересадок
const getChanges = num => {
    if(num){
        return num === 1 ? "С одной пересадкой" : "Больше одной пересадки";
    }else{
        return "Без пересадок";
    };
};

//создание карточек с выводом информации о билете
const createCard = (data) => {
    const ticket = document.createElement('article');
    ticket.classList.add('ticket');

    let deep = '';

    if(data){
        deep = `
        <h3 class="agent">${data.gate}</h3>
            <div class="ticket__wrapper">
	        <div class="left-side">
		    <a href="${getAirLink(data)}" target="_blank" class="button button__buy">Купить
			за ${data.value}</a>
	        </div>
	    <div class="right-side">
		<div class="block-left">
			<div class="city__from">Вылет из города:
				<span class="city__name">${getNameCity(data.origin)}</span>
			</div>
			<div class="date">${getDate(data.depart_date)}</div>
		</div>

		<div class="block-right">
			<div class="changes">${getChanges(data.number_of_changes)}</div>
			<div class="city__to">Город назначения:
				<span class="city__name">${getNameCity(data.destination)}</span>
			</div>
		</div>
	    </div>
        </div>
        `;
    }else{
        deep = '<h3>К сожалению нет билетов на выбраные даты</h3>'
    };

    ticket.insertAdjacentHTML('afterbegin', deep);

    return ticket;
}

//инициализация на страничке самого дешевого билета
const renderCheapDay = (cheapTick) => {
    chipestTicket.style.display = "block";
    chipestTicket.innerHTML = "<h2>Самый дешевый билет на выбранную дату</h2>";
    
    const ticket = createCard(cheapTick[0]);
    chipestTicket.append(ticket);
};

//инициализация на страничке остальных дешевых предложений
const renderCheapYear = (cheapTickS) => {
    otherCheapTickets.style.display = "block";
    otherCheapTickets.innerHTML = "<h2>Самые дешевые билеты на другие даты</h2>";

    //сортировка обектов массива по цене
    const sortedTickS = cheapTickS.sort((a, b) => a.value - b.value);
    for(let i = 0; i < sortedTickS.length && i < MAX_COUNT; i++){
        const ticket = createCard(sortedTickS[i]);
        otherCheapTickets.append(ticket);
    }
};

//фнкция для определения списка подходящих билетов и 
//билета на нашу дату
const renderCheap = (data, when) => {
    const cheapTicket = JSON.parse(data).best_prices;
    const cheapTicketDay = cheapTicket.filter(item => item.depart_date === when);
    
    renderCheapDay(cheapTicketDay);
    renderCheapYear(cheapTicket);
};

//функция "живого поиска" по городам "из"
inputCitiesFrom.addEventListener('input', (event) => {
    showCity(inputCitiesFrom, dropdownCitiesFrom, event);
});


//функция обработки на клик ))по елементу списка "из"
dropdownCitiesFrom.addEventListener('click', (event) => {
    hendlerCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

//функция "живого поиска" по городам "в"
inputCitiesTo.addEventListener('input', (event) => {
    showCity(inputCitiesTo, dropdownCitiesTo, event);
});

//функция обработки на клик ))по елементу списка "в"
dropdownCitiesTo.addEventListener('click', (event) => {
        hendlerCity(event, inputCitiesTo, dropdownCitiesTo);
});

//функция обработки клика на крестик на закритие модальных окон
modalClose.addEventListener('click', modalCloseFunc);

//функция обработки клика на оверлей на закритие модальных окон
overlayModal.addEventListener('click', modalCloseFunc);

//функция на закритие модальных окон по нажатию на esc
document.body.addEventListener('keyup', (event) => {
    let key = event.keyCode;
    if(key === 27){
        modalCloseFunc();
    }
});

//функция обработки отправки данных
formSearch.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = {
        from: city.find(item => inputCitiesFrom.value === item.name),
        to: city.find(item => inputCitiesTo.value === item.name),
        when: inputDateDepart.value,
    };

    /*
    const reqestData = '?depart_date=' + formData.when +
    '&origin=' + formData.from +
    '&destination=' + formData.to +
    '&token=' + API_KEY;
    */

//или с помощю интерполяции
    if(formData.from && formData.to){
        const reqestData = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&token=${API_KEY}`;
        getData(CALENDAR + reqestData, (response) => {
            renderCheap(response, formData.when);
        },(error) => {
            modalOpenFunc('Такое направление отсутсвует.');
            
            console.log('Ошибка :' + error);
        });
    }else{
        modalOpenFunc('Введите кректное название города!');
    };  
});

//получение обекта городов
getData(CITIES_API, (data) => {
    city = JSON.parse(data).filter(item => item.name);
    
    /*тоже самое что
      city = JSON.parse(data).filter((item) => {
          if(item.name === true){
              return true;
          }
          );
    
    */
});

//функция поиска билетов
/*
getPrice(`${CALENDAR}
currency=rub&period_type=month&beginning_of_period=2020-06-01&
origin=SVX&destination=KGD&page=1&limit=30&show_to_affiliates=true&sorting=price&token=
${API_KEY}`, (data) => {
    let price = JSON.parse(data);
    let lowestPrice = price.data[0];
    console.log(lowestPrice);
});
*/

//Собственная функция дла выдачи IATA кода с массива городов
/*
const giveMeCode = (arr, nameOfTown) => {
    let town = arr.filter(item => {
        return item.name === nameOfTown ? true : false;
    });
    return town[0].code;
}
*/
