import { Directive, HostBinding, HostListener, computed, signal } from '@angular/core';

// Controls the pop-up text on a card (homepage strongest suits, Skills page).
//  - Mouse: the text shows while hovering. Clicking hides it; clicking again shows it.
//  - Phone: tap to show, tap the same card again to hide (tapping elsewhere also hides it).
//  - Keyboard: Enter or Space shows / hides it.
// The card gets the class "tip-open" while its text should be visible.
@Directive({
  selector: '[appTipToggle]',
  standalone: false,
})
export class TipToggleDirective {
  private readonly open = signal(false);       // opened by click, tap or key
  private readonly hovering = signal(false);   // a mouse is over the card
  private readonly dismissed = signal(false);  // closed by click while hovering

  private readonly shown = computed(() => this.open() || (this.hovering() && !this.dismissed()));

  @HostBinding('class.tip-open')
  get isShown(): boolean { return this.shown(); }

  @HostListener('pointerenter', ['$event'])
  onEnter(e: PointerEvent): void {
    if (e.pointerType === 'mouse') { this.hovering.set(true); }
  }

  @HostListener('pointerleave', ['$event'])
  onLeave(e: PointerEvent): void {
    if (e.pointerType === 'mouse') {
      this.hovering.set(false);
      this.dismissed.set(false);
      this.open.set(false);
    }
  }

  @HostListener('click')
  toggle(): void {
    if (this.shown()) {
      this.open.set(false);
      this.dismissed.set(true);
    } else {
      this.open.set(true);
      this.dismissed.set(false);
    }
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onKey(e: Event): void {
    e.preventDefault();
    this.toggle();
  }

  // Moving focus away (tapping somewhere else, or Tab) closes it
  @HostListener('focusout')
  onBlur(): void {
    this.open.set(false);
  }
}
