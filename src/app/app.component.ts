import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>{{ typingText }}</h1>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
      color: #3f51b5;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  typingText = '';
  private typingFullText = 'Frontend Engineer Form';
  private typingIndex = 0;
  private typingTimer: any;

  ngOnInit(): void {
    this.startTyping();
  }

  ngOnDestroy(): void {
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
    }
  }

  private startTyping() {
    this.typingIndex = 0;
    this.typingText = '';
    if (this.typingTimer) clearInterval(this.typingTimer);
    this.typingTimer = setInterval(() => {
      if (this.typingIndex < this.typingFullText.length) {
        this.typingText += this.typingFullText[this.typingIndex++];
      } else {
        clearInterval(this.typingTimer);
      }
    }, 60);
  }
}
