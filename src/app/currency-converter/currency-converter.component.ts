import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../currency.service';

@Component({
  selector: 'app-currency-converter',
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.css']
})
export class CurrencyConverterComponent implements OnInit {
  currencies: string[] = [];
  filteredFromCurrencies: string[] = [];
  filteredToCurrencies: string[] = [];
  filteredThirdCurrencies: string[] = [];
  fromCurrency = '';
  toCurrency = '';
  thirdCurrency = '';
  fromAmount: number | null = null;
  toAmount: number | null = null;
  thirdAmount: number | null = null;
  loading = false;
  error = '';
  rates: { [key: string]: number } = {};
  
  lastUpdated: string = '';
  favorites: string[] = [];
  copied = false;
  darkMode = false;

  // New features
  quickAmounts: number[] = [1, 10, 100, 500, 1000, 5000];
  popularCurrencies: string[] = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'PGK'];
  showExtras = false;
  splitPeople: number = 2;
  feePercent: number = 0;
  
  currencyNames: { [key: string]: string } = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    INR: 'Indian Rupee',
    PKR: 'Pakistani Rupee',
    PGK: 'Papua New Guinean Kina',
    AED: 'UAE Dirham',
    SAR: 'Saudi Riyal',
    JPY: 'Japanese Yen',
    CNY: 'Chinese Yuan',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    CHF: 'Swiss Franc',
    SGD: 'Singapore Dollar',
    MYR: 'Malaysian Ringgit',
    BDT: 'Bangladeshi Taka',
    NZD: 'New Zealand Dollar',
    ZAR: 'South African Rand',
    BRL: 'Brazilian Real',
    RUB: 'Russian Ruble',
    KRW: 'South Korean Won',
    THB: 'Thai Baht',
    IDR: 'Indonesian Rupiah',
    PHP: 'Philippine Peso',
    VND: 'Vietnamese Dong',
    TRY: 'Turkish Lira',
    MXN: 'Mexican Peso',
    NOK: 'Norwegian Krone',
    SEK: 'Swedish Krona',
    DKK: 'Danish Krone',
    HKD: 'Hong Kong Dollar',
    TWD: 'Taiwan Dollar',
    PLN: 'Polish Zloty',
    CZK: 'Czech Koruna',
    HUF: 'Hungarian Forint',
    ILS: 'Israeli Shekel',
    CLP: 'Chilean Peso',
    ARS: 'Argentine Peso',
    COP: 'Colombian Peso',
    PEN: 'Peruvian Sol',
    EGP: 'Egyptian Pound',
    NGN: 'Nigerian Naira',
    KES: 'Kenyan Shilling',
    GHS: 'Ghanaian Cedi',
    QAR: 'Qatari Riyal',
    KWD: 'Kuwaiti Dinar',
    BHD: 'Bahraini Dinar',
    OMR: 'Omani Rial',
    JOD: 'Jordanian Dinar',
    LKR: 'Sri Lankan Rupee',
    NPR: 'Nepalese Rupee',
    MMK: 'Myanmar Kyat'
  };

  // Computed values
  get toAmountWithFee(): number | null {
    if (this.toAmount === null) return null;
    return +(this.toAmount * (1 + this.feePercent / 100)).toFixed(2);
  }

  get thirdAmountWithFee(): number | null {
    if (this.thirdAmount === null) return null;
    return +(this.thirdAmount * (1 + this.feePercent / 100)).toFixed(2);
  }

  get toAmountPerPerson(): number | null {
    if (this.toAmountWithFee === null) return null;
    return +(this.toAmountWithFee / this.splitPeople).toFixed(2);
  }

  get thirdAmountPerPerson(): number | null {
    if (this.thirdAmountWithFee === null) return null;
    return +(this.thirdAmountWithFee / this.splitPeople).toFixed(2);
  }

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.loadFromStorage();
    this.loading = true;
    this.currencyService.getCurrencies().subscribe({
      next: (data) => {
        this.currencies = Object.keys(data.rates);
        this.filteredFromCurrencies = [...this.currencies];
        this.filteredToCurrencies = [...this.currencies];
        this.filteredThirdCurrencies = [...this.currencies];
        this.lastUpdated = new Date(data.time_last_update_utc).toLocaleString();
        this.loading = false;
        
        // Set default currencies PGK to USD to INR
        this.fromCurrency = 'PGK';
        this.toCurrency = 'USD';
        this.thirdCurrency = 'INR';
        this.fromAmount = 1;
        this.onCurrencyChange();
      },
      error: () => {
        this.error = 'Failed to load currencies';
        this.loading = false;
      }
    });
  }

  loadFromStorage(): void {
    const savedFavorites = localStorage.getItem('favorites');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedFavorites) this.favorites = JSON.parse(savedFavorites);
    if (savedDarkMode) this.darkMode = JSON.parse(savedDarkMode);
  }

  saveToStorage(): void {
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
    localStorage.setItem('darkMode', JSON.stringify(this.darkMode));
  }

  toggleFavorite(currency: string): void {
    const index = this.favorites.indexOf(currency);
    if (index > -1) {
      this.favorites.splice(index, 1);
    } else {
      this.favorites.push(currency);
    }
    this.saveToStorage();
    this.sortCurrencies();
  }

  isFavorite(currency: string): boolean {
    return this.favorites.includes(currency);
  }

  sortCurrencies(): void {
    const sortFn = (a: string, b: string) => {
      const aFav = this.favorites.includes(a);
      const bFav = this.favorites.includes(b);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.localeCompare(b);
    };
    this.filteredFromCurrencies.sort(sortFn);
    this.filteredToCurrencies.sort(sortFn);
    this.filteredThirdCurrencies.sort(sortFn);
  }

  copyResult(): void {
    if (this.toAmount !== null && this.thirdAmount !== null) {
      const text = `${this.fromAmount} ${this.fromCurrency} = ${this.toAmount} ${this.toCurrency} = ${this.thirdAmount} ${this.thirdCurrency}`;
      navigator.clipboard.writeText(text);
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    }
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    this.saveToStorage();
  }

  toggleExtras(): void {
    this.showExtras = !this.showExtras;
  }

  onFromCurrencySearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toUpperCase();
    this.filteredFromCurrencies = this.currencies.filter(c => 
      c.includes(value) || (this.currencyNames[c]?.toUpperCase().includes(value))
    );
    this.sortCurrencies();
  }

  onToCurrencySearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toUpperCase();
    this.filteredToCurrencies = this.currencies.filter(c => 
      c.includes(value) || (this.currencyNames[c]?.toUpperCase().includes(value))
    );
    this.sortCurrencies();
  }

  onThirdCurrencySearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toUpperCase();
    this.filteredThirdCurrencies = this.currencies.filter(c => 
      c.includes(value) || (this.currencyNames[c]?.toUpperCase().includes(value))
    );
    this.sortCurrencies();
  }

  swapCurrencies(): void {
    const tempCurrency = this.fromCurrency;
    const tempAmount = this.fromAmount;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = this.thirdCurrency;
    this.thirdCurrency = tempCurrency;
    this.fromAmount = this.toAmount;
    this.toAmount = this.thirdAmount;
    this.thirdAmount = tempAmount;
    this.onCurrencyChange();
  }

  onCurrencyChange(): void {
    if (this.fromCurrency && this.currencies.includes(this.fromCurrency)) {
      this.currencyService.getConversionRate(this.fromCurrency).subscribe({
        next: (data) => {
          this.rates = data.rates;
          this.lastUpdated = new Date(data.time_last_update_utc).toLocaleString();
          if (this.fromAmount) {
            this.convertFromAmount();
          }
        },
        error: () => {
          this.error = 'Failed to get conversion rates';
        }
      });
    }
  }

  convertFromAmount(): void {
    if (this.toCurrency && this.fromAmount !== null && this.rates[this.toCurrency]) {
      this.toAmount = +(this.fromAmount * this.rates[this.toCurrency]).toFixed(2);
    }
    if (this.thirdCurrency && this.fromAmount !== null && this.rates[this.thirdCurrency]) {
      this.thirdAmount = +(this.fromAmount * this.rates[this.thirdCurrency]).toFixed(2);
    }
  }

  convertToAmount(): void {
    if (this.toCurrency && this.toAmount !== null && this.rates[this.toCurrency]) {
      this.fromAmount = +(this.toAmount / this.rates[this.toCurrency]).toFixed(2);
    }
  }

  onFromAmountChange(): void {
    if (this.fromCurrency && this.toCurrency && this.fromAmount) {
      if (Object.keys(this.rates).length === 0) {
        this.onCurrencyChange();
      } else {
        this.convertFromAmount();
      }
    }
  }

  onToAmountChange(): void {
    if (this.fromCurrency && this.toCurrency && this.toAmount) {
      if (Object.keys(this.rates).length === 0) {
        this.onCurrencyChange();
      } else {
        this.convertToAmount();
      }
    }
  }

  onThirdCurrencyChange(): void {
    if (this.fromAmount && this.thirdCurrency && this.rates[this.thirdCurrency]) {
      this.thirdAmount = +(this.fromAmount * this.rates[this.thirdCurrency]).toFixed(2);
    } else {
      this.onCurrencyChange();
    }
  }

  setQuickAmount(amount: number): void {
    this.fromAmount = amount;
    this.onFromAmountChange();
  }

  setFromCurrency(currency: string): void {
    this.fromCurrency = currency;
    this.onCurrencyChange();
  }

  setToCurrency(currency: string): void {
    this.toCurrency = currency;
    this.onCurrencyChange();
  }

  setThirdCurrency(currency: string): void {
    this.thirdCurrency = currency;
    this.onThirdCurrencyChange();
  }

  shareResult(): void {
    if (navigator.share && this.toAmount && this.thirdAmount) {
      navigator.share({
        title: 'Currency Conversion',
        text: `${this.fromAmount} ${this.fromCurrency} = ${this.toAmount} ${this.toCurrency} = ${this.thirdAmount} ${this.thirdCurrency}`
      });
    } else {
      this.copyResult();
    }
  }
}
