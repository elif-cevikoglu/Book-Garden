import { LightningElement, api } from 'lwc';

export default class BookGardenTile extends LightningElement {
  likes = 0;
  dislikes = 0;
  book_ = {Id: ''};
  @api set book(value) {
    this.book_ = JSON.parse(JSON.stringify(value));
    this.selected = this.book_.Id === this.selectedId;
    this.likes = this.book.hasOwnProperty('Likes__c') ? this.book.Likes__c : 0;
    this.dislikes = this.book.hasOwnProperty('Dislikes__c') ? this.book.Dislikes__c : 0;
  }

  get book() {
    return this.book_;
  }

  selectedId_;
  @api set selectedId(value) {
    if (value) {
      const selectedId = JSON.parse(JSON.stringify(value));
      this.selectedId_ = selectedId;

      this.selected = this.book_.Id === selectedId;
    } 
  }

  get selectedId() {
    return this.selectedId_;
  }
  
  selected = false;
  
  get className() {
    return this.selected ? 'content selected' : 'content';
  }


  handleBookSelected() {
    if (!this.selected) {
      this.dispatchEvent(new CustomEvent("bookselected", { detail: this.book }));
      this.selected = true;
    } else {
      this.dispatchEvent(new CustomEvent("bookselected", { detail: false }));
      this.selected = false;
    }
  }
}