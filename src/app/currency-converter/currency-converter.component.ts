import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../currency.service';

@Component({
  selector: 'app-currency-converter',
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.css']
})
export class CurrencyConverterComponent implements OnInit {
  currencies: string[] = [];
  fromCurrency = '';
  toCurrency = '';
  fromAmount: number | null = null;
  toAmount: number | null = null;
  loading = false;
  error = '';
  private rates: { [key: string]: number } = {};

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.loading = true;
    this.currencyService.getCurrencies().subscribe({
      next: (data) => {
        this.currencies = Object.keys(data.rates);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load currencies';
        this.loading = false;
      }
    });
  }

  onCurrencyChange(): void {
    if (this.fromCurrency) {
      this.currencyService.getConversionRate(this.fromCurrency).subscribe({
        next: (data) => {
          this.rates = data.rates;
          if (this.fromAmount) {
            this.convertFromAmount();
          } else if (this.toAmount) {
            this.convertToAmount();
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
}
