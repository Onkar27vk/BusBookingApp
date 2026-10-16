const $ = (selector) => document.querySelector(selector);
const modal = $('#modal');
const modalContent = $('#modal-content');
const from = $('#from');
const to = $('#to');
const dateInput = $('#travel-date');
let selectedTrip = null;
let selectedSeats = [];
let passengerCount = 1;
const today = new Date();
const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
dateInput.min = localDate;
dateInput.value = localDate;
const routes = {
  'New York|Boston': {duration:'4h 15m', prices:[24,31,38], times:['08:30 AM','01:15 PM','06:45 PM']},
  'New York|Washington, DC': {duration:'4h 45m', prices:[29,36,44], times:['07:15 AM','12:30 PM','05:50 PM']},
  'New York|Philadelphia': {duration:'2h 00m', prices:[18,22,28], times:['09:00 AM','02:00 PM','07:15 PM']},
  'Boston|New York': {duration:'4h 25m', prices:[25,32,39], times:['08:00 AM','01:30 PM','06:20 PM']},
  'Washington, DC|New York': {duration:'4h 50m', prices:[30,37,45], times:['07:45 AM','12:10 PM','05:30 PM']},
  'San Francisco|Los Angeles': {duration:'6h 30m', prices:[35,42,52], times:['08:00 AM','12:45 PM','05:15 PM']},
  'Los Angeles|San Francisco': {duration:'6h 40m', prices:[35,43,53], times:['08:15 AM','01:00 PM','05:30 PM']},
  'Chicago|New York': {duration:'13h 20m', prices:[59,72,85], times:['07:00 AM','11:30 AM','08:15 PM']},
  'Seattle|Portland': {duration:'3h 15m', prices:[22,28,34], times:['09:00 AM','02:15 PM','06:00 PM']},
  'Austin|Denver': {duration:'14h 10m', prices:[68,79,94], times:['06:30 AM','12:00 PM','09:00 PM']},
  'Miami|Washington, DC': {duration:'16h 25m', prices:[74,89,109], times:['07:00 AM','01:00 PM','08:00 PM']},
  'Philadelphia|New York': {duration:'2h 05m', prices:[18,23,29], times:['09:15 AM','02:30 PM','07:00 PM']},
};
function getRoute(a,b){return routes[`${a}|${b}`] || {duration:'5h 45m',prices:[32,41,52],times:['08:00 AM','01:00 PM','06:00 PM']}}
function dateLabel(){return new Date(`${dateInput.value}T12:00:00`).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
function openModal(html){modalContent.innerHTML=html;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function showTrips(){
  if(from.value===to.value){toast('Choose two different cities to find a bus.');return}
  passengerCount=Number($('#passengers').value);selectedTrip=null;selectedSeats=[];
  const route=getRoute(from.value,to.value);
  openModal(`<span class="modal-kicker">YOUR JOURNEY, YOUR WAY</span><h2 id="modal-title">${from.value} <span style="color:#97a097">→</span> ${to.value}</h2><p class="modal-sub">${dateLabel()} &nbsp;·&nbsp; ${passengerCount} ${passengerCount===1?'passenger':'passengers'} &nbsp;·&nbsp; ${route.duration}</p><div class="trip-list">${route.times.map((time,i)=>`<button class="trip-option" data-trip="${i}"><span><span class="trip-time">${time}</span><span class="trip-place">${from.value} · Central Station</span></span><span class="trip-duration">${route.duration}<span class="trip-place">Direct · Roam Express</span></span><span class="trip-place">${shiftTime(time,route.duration)}<span class="trip-place">${to.value} · Bus Terminal</span></span><span class="trip-price">$${route.prices[i]}<small>per seat</small></span></button>`).join('')}</div><div class="continue-row"><small>Free cancellation within 24 hours</small><button class="primary-btn" id="choose-seats" disabled>Choose seats →</button></div>`);
  modalContent.querySelectorAll('.trip-option').forEach(btn=>btn.addEventListener('click',()=>{modalContent.querySelectorAll('.trip-option').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');selectedTrip=Number(btn.dataset.trip);$('#choose-seats').disabled=false}));
  $('#choose-seats').addEventListener('click',showSeats);
}
function shiftTime(time,duration){const [hms,ap]=time.split(' ');let [h,m]=hms.split(':').map(Number);if(ap==='PM'&&h<12)h+=12;if(ap==='AM'&&h===12)h=0;const [dh,dm]=duration.split(/[hm ]+/).filter(Boolean).map(Number);const total=h*60+m+dh*60+dm;const hour=Math.floor(total/60)%24;return `${String((hour%12)||12).padStart(2,'0')}:${String(total%60).padStart(2,'0')} ${hour>=12?'PM':'AM'}`}
function showSeats(){
  const route=getRoute(from.value,to.value);const price=route.prices[selectedTrip];selectedSeats=[];
  const seats=Array.from({length:30},(_,i)=>{const row=Math.floor(i/4)+1;const col=i%4;const name=`${row}${String.fromCharCode(65+col)}`;const taken=[2,6,10,13,19,25].includes(i);const aisle=col===2?'aisle':'';return `<button class="seat ${aisle}" data-seat="${name}" ${taken?'disabled':''}>${name}</button>`}).join('');
  openModal(`<span class="modal-kicker">ALMOST THERE</span><h2 id="modal-title">Pick your seats</h2><p class="modal-sub">${from.value} → ${to.value} &nbsp;·&nbsp; ${dateLabel()}</p><div class="booking-layout"><div class="bus-deck"><div class="deck-label">FRONT OF BUS &nbsp; ▱</div><div class="seat-map">${seats}</div><div class="seat-legend"><span><i class="legend-dot"></i>Available</span><span><i class="legend-dot chosen"></i>Selected</span><span><i class="legend-dot taken"></i>Taken</span></div></div><div class="seat-summary"><h3>Your booking</h3><p>${from.value} → ${to.value}<br>${dateLabel()} · ${route.duration}</p><div class="summary-line"><span>Seats</span><b id="seat-label">Choose ${passengerCount} seat${passengerCount>1?'s':''}</b></div><div class="summary-line"><span>Fare · $${price} × <span id="seat-count">0</span></span><b id="fare-total">$0</b></div><div class="summary-line total"><span>Total</span><b id="total-cost">$0</b></div><button class="primary-btn" id="passenger-details" style="width:100%" disabled>Passenger details →</button></div></div>`);
  modalContent.querySelectorAll('.seat:not(:disabled)').forEach(btn=>btn.addEventListener('click',()=>{const seat=btn.dataset.seat;if(selectedSeats.includes(seat)){selectedSeats=selectedSeats.filter(x=>x!==seat);btn.classList.remove('selected')}else if(selectedSeats.length<passengerCount){selectedSeats.push(seat);btn.classList.add('selected')}updateSeatSummary(price)}));
  $('#passenger-details').addEventListener('click',showPassengerForm);
}
function updateSeatSummary(price){$('#seat-label').textContent=selectedSeats.length?selectedSeats.join(', '):`Choose ${passengerCount} seat${passengerCount>1?'s':''}`;$('#seat-count').textContent=selectedSeats.length;$('#fare-total').textContent=`$${price*selectedSeats.length}`;$('#total-cost').textContent=`$${price*selectedSeats.length}`;$('#passenger-details').disabled=selectedSeats.length!==passengerCount}
function showPassengerForm(){const route=getRoute(from.value,to.value);const total=route.prices[selectedTrip]*passengerCount;openModal(`<span class="modal-kicker">TRAVELER INFORMATION</span><h2 id="modal-title">Who’s coming along?</h2><p class="modal-sub">Your tickets will be sent straight to your inbox.</p><form id="checkout-form" class="passenger-form"><label>Full name<input name="name" placeholder="As shown on your ID" autocomplete="name" required></label><label>Email address<input name="email" type="email" placeholder="you@example.com" autocomplete="email" required></label><label>Phone number<input name="phone" type="tel" placeholder="(555) 000-0000" autocomplete="tel" required></label><div class="summary-line total"><span>${passengerCount} ${passengerCount===1?'seat':'seats'} · ${selectedSeats.join(', ')}</span><b>$${total}</b></div><button class="primary-btn" type="submit" style="width:100%">Confirm booking · $${total}</button></form>`);$('#checkout-form').addEventListener('submit',e=>{e.preventDefault();const traveler=new FormData(e.target);showConfirmation(traveler.get('name'),traveler.get('email'),total)})}
function showConfirmation(name,email,total){const code=`RM${Math.random().toString(36).slice(2,8).toUpperCase()}`;openModal(`<div class="confirm-wrap"><div class="success-icon">✓</div><span class="modal-kicker">YOU’RE ALL SET</span><h2 id="modal-title">Happy trails, ${escapeHtml(name.split(' ')[0])}!</h2><p class="modal-sub">Your trip is booked. We sent the details to ${escapeHtml(email)}.</p><div class="booking-code">${code}</div><div class="confirm-details">${from.value} → ${to.value} · ${dateLabel()}<br>${selectedSeats.length} ${selectedSeats.length===1?'seat':'seats'} (${selectedSeats.join(', ')}) · $${total}</div><button class="primary-btn" data-close style="margin-top:22px">Back to Roam</button></div>`)}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
let toastTimer;
function toast(message){let el=$('.toast');if(!el){el=document.createElement('div');el.className='toast';document.body.appendChild(el)}el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2600)}
$('#search-btn').addEventListener('click',showTrips);
$('#swap').addEventListener('click',()=>{const current=from.value;from.value=to.value;to.value=current});
$('#see-all').addEventListener('click',()=>{$('#trips').scrollIntoView({behavior:'smooth'});toast('Choose a popular journey to start booking.')});
document.querySelectorAll('.route-card').forEach(card=>card.addEventListener('click',()=>{from.value=card.dataset.from;to.value=card.dataset.to;window.scrollTo({top:0,behavior:'smooth'});setTimeout(showTrips,350)}));
modal.addEventListener('click',e=>{if(e.target.matches('[data-close]'))closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
