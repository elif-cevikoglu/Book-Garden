import { LightningElement, api } from 'lwc';

export default class BookGardenList extends LightningElement {
  books_ = [];
  bookName = '';
  selectedId = false;
  
  @api set books(value) {
    if (value) {
      this.books_ = JSON.parse(JSON.stringify(value));
      console.log(JSON.parse(JSON.stringify(value)))
    }
  };

  get books() {
    return this.books_;
  }
  
  handleBookSelected(event) {
    const detail = JSON.parse(JSON.stringify(event.detail));
    if (detail) {
      this.selectedId = detail.Id;
    }
    this.dispatchEvent(new CustomEvent("bookselected", { detail }));
  }
}