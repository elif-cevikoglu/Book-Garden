import { LightningElement } from 'lwc';
import getBooksApex from "@salesforce/apex/BookGardenController.getBooks";
import getBookCountApex from "@salesforce/apex/BookGardenController.getBookCount";
import getBiggestPageNumApex from "@salesforce/apex/BookGardenController.getBiggestPageNum";
import reactToBookApex from "@salesforce/apex/BookGardenController.reactToBook";
import commentOnBookApex from "@salesforce/apex/BookGardenController.commentOnBook";
import archiveBookApex from "@salesforce/apex/BookGardenController.archiveBook";
import deleteBookApex from "@salesforce/apex/BookGardenController.deleteBook";

export default class GardenBookOverview extends LightningElement {
  pageInt = 1;
  nameStr = '';
  bookCount;
  books = [];
  booksToShow;
  isLoading = true;
  delayTimeout = '';
  bookName = '';
  authorName = '';
  biggestPageNum = 5000;
  maxPageNum = 5000;
  genre = 'Default';

  selectedBook;

  get genreOptions() {
      return [
        { label: 'Default', value: 'Default' },
        { label: 'Adventure', value: 'Adventure' },
        { label: 'Biography/Autobiography', value: 'Biography/Autobiography' },
        { label: 'Classic Literature', value: 'Classic Literature' },
        { label: 'Contemporary Fiction', value: 'Contemporary Fiction' },
        { label: 'Cookbooks', value: 'Cookbooks' },
        { label: 'Crime Fiction', value: 'Crime Fiction' },
        { label: 'Dystopian', value: 'Dystopian' },
        { label: 'Fantasy', value: 'Fantasy' },
        { label: 'Graphic Novels/Comics', value: 'Graphic Novels/Comics' },
        { label: 'Historical Fiction', value: 'Historical Fiction' },
        { label: 'Horror', value: 'Horror' },
        { label: 'Mystery', value: 'Mystery' },
        { label: 'Non-Fiction', value: 'Non-Fiction' },
        { label: 'Poetry', value: 'Poetry' },
        { label: 'Romance', value: 'Romance' },
        { label: 'Science/Nature', value: 'Science/Nature' },
        { label: 'Science Fiction', value: 'Science Fiction' },
        { label: 'Self-Help', value: 'Self-Help' },
        { label: 'Thriller', value: 'Thriller' },
        { label: 'Young Adult', value: 'Young Adult' },
      ];
  }
  
  get disableNextPage() {
    return this.pageInt === Math.ceil(this.bookCount / 6);
  }

  get disablePreviousPage() {
    return this.pageInt === 1;
  }

  async connectedCallback() {
    this.isLoading = true;
    await this.findBiggestPageNum();
    await this.getBooks();
    this.isLoading = false;
  }

  async getBookCount() {
    const genreStr = this.genre === 'Default' || !this.genre ? '' : this.genre;
    this.bookCount = await getBookCountApex({bookName: this.bookName, authorName: this.authorName,  nop: this.maxPageNum, genreStr: genreStr});
  }

  async getBooks() {
    try {
      const genreStr = this.genre === 'Default' || !this.genre ? '' : this.genre;
      console.log({pageInt: this.pageInt, bookName: this.bookName, authorName: this.authorName,  nop: this.maxPageNum, genreStr: genreStr});
      this.isLoading = true;
      await this.getBookCount();

      const booksRes = await getBooksApex({pageInt: this.pageInt, bookName: this.bookName, authorName: this.authorName,  nop: this.maxPageNum, genreStr: genreStr});
      this.books = JSON.parse(JSON.stringify(booksRes));
      this.booksToShow = JSON.parse(JSON.stringify(booksRes));
      console.log(this.books);
      
      this.isLoading = false;
    } catch(err) {
      console.error(err);
    }
  }

  async findBiggestPageNum() {
    try {
      this.biggestPageNum = await getBiggestPageNumApex();
      this.maxPageNum = this.biggestPageNum;
    } catch(err) {
      this.biggestPageNum = 5000;
      console.log(err);
    }
  }

  filterBooks() {
    this.isLoading = true;
    try {
      window.clearTimeout(this.delayTimeout);
      this.delayTimeout = setTimeout(() => {
        this.booksToShow = this.books.filter(book => {
          return ((book.Number_of_Pages__c <= Number(this.maxPageNum)) 
                                          && (book.Name.toLowerCase().includes(this.bookName))
                                          && (book.Author__r.Name.toLowerCase().includes(this.authorName))
                                          && (this.genre !== 'Default' ? book.Genre__c.split(';').includes(this.genre) : true));
          });
          console.log(this.booksToShow);
        }, 300);
      this.isLoading = false;
    } catch(err) {
      console.log(err);
    }
  }

  handleBookNameChange(event) {
    this.bookName = event.target.value.toLowerCase() || '' ;
  }
  
  handleAuthorNameChange(event) {
    this.authorName = event.target.value.toLowerCase() || '' ;
  }
  
  handleMaxPageNumChange(event) {
    this.maxPageNum = event.target.value;
  }

  handleGenreChange(event) {
    this.genre = event.detail.value;
  }

  handleSearch() {
    this.pageInt = 1;
    this.getBooks();
  }

  handleNextPage() {
    this.pageInt = this.pageInt + 1;
    this.getBooks();
  }

  handlePreviousPage() {
    this.pageInt = this.pageInt - 1;
    this.getBooks();
  }

  resetFilters() {
    this.bookName = '';
    this.authorName = '';
    this.maxPageNum = this.biggestPageNum;
    this.genre = 'Default';
  }

  handleBookSelected(event) {
    this.selectedBook = JSON.parse(JSON.stringify(event.detail));
  }

  async handleReactedToBook(event) {
    const res = await reactToBookApex({bookId: event.detail.bookId, reaction: event.detail.reaction, amount: event.detail.amount});
    if (res) {
      this.books = this.books.map(book => {
        if (book.Id === event.detail.bookId) {
          if (event.detail.reaction === 'like') {
            book.Likes__c = book.hasOwnProperty('Likes__c') ? book.Likes__c + 1 : 1;
            return book;
          } else {
            book.Dislikes__c = book.hasOwnProperty('Dislikes__c') ? book.Dislikes__c + 1 : 1;
            return book;
          }
        }
        return book;
      });
      this.filterBooks();
    }
  }

  async handleCommentedOnBook(event) {
    const res = await commentOnBookApex({bookId: event.detail.bookId, comment: event.detail.comment});
    if (res) {
      await this.getBooks();
    }
  }

  async handleBookCreated(event) {
    this.selectedBook = JSON.parse(JSON.stringify(event.detail));
    await this.getBooks();
    this.template.querySelector('lightning-tabset').activeTabValue = 'search-tab';
  }

  bookToEdit = false;
  authorToEdit = false;
  async handleEditBook(event) {
    this.authorToEdit = false;
    this.bookToEdit = JSON.parse(JSON.stringify(event.detail.bookToEdit));
    this.template.querySelector('lightning-tabset').activeTabValue = 'edit-tab';
  }

  async handleEditAuthor(event) {
    this.bookToEdit = false;
    this.authorToEdit = JSON.parse(JSON.stringify(event.detail.authorToEdit));
    this.template.querySelector('lightning-tabset').activeTabValue = 'edit-tab';
  }

  async handleBookEdited(event) {
    this.authorToEdit = false;
    this.bookToEdit = false;
    this.selectedBook = false;
    await this.getBooks();
    this.template.querySelector('lightning-tabset').activeTabValue = 'search-tab';
  }

  async handleAuthorEdited(event) {
    this.bookToEdit = false;
    this.authorToEdit = false;
    this.selectedBook = false;
    await this.getBooks();
    this.template.querySelector('lightning-tabset').activeTabValue = 'search-tab';
  }

  async handleArchiveBook(event) {
    console.log('ARCHIVE => ' + event.detail);
    const res = await archiveBookApex({bookId: event.detail.bookId, archived: event.detail.archived});
    console.log(res);
    if (typeof res === 'boolean') {
      this.bookToEdit = false;
      this.authorToEdit = false;
      this.selectedBook = false;
      await this.getBooks();
      this.template.querySelector('lightning-tabset').activeTabValue = 'search-tab';
    }
  }

  async handleDeleteBook(event) {
    console.log('DELETE => ' + event.detail);
    const res = await deleteBookApex({bookId: event.detail.bookId});
    console.log(res);

    if (typeof res === 'boolean') {
      this.bookToEdit = false;
      this.authorToEdit = false;
      this.selectedBook = false;
      await this.getBooks();
      this.template.querySelector('lightning-tabset').activeTabValue = 'search-tab';
    }
  }

}