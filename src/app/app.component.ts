import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'hz-date-picker';
  date: Date;
  dateArr: Date[];
  time = '00:00:00';
  show() {
    console.log(this.dateArr);
  }
}
