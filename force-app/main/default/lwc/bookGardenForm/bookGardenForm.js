import { LightningElement, api } from 'lwc';
import createBookApex from "@salesforce/apex/BookGardenController.createBook";
import createAuthorApex from "@salesforce/apex/BookGardenController.createAuthor";
import editBookApex from "@salesforce/apex/BookGardenController.editBook";
import editAuthorApex from "@salesforce/apex/BookGardenController.editAuthor";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class BookGardenForm extends LightningElement {
    @api operation = 'create';
    get createOperationBoolean() {
        return this.operation === 'create';
    }
    
    authorToEdit_;
    @api set authorToEdit(value) {
        if (value) {
            const author = JSON.parse(JSON.stringify(value));
            console.log(author);
            this.authorId = author.Id || '';
            this.nameStr = author.Name || '';
            this.fromStr = author.From__c || '';
            this.bornInStr = author.Born_In__c || '';
            this.diedInStr = author.Died_In__c || '';
            this.lifeStr = author.Life__c || '';
            this.imageSourceAuthor = author.Image_Source__c || '';
            this.authorToEdit_ = author;
        } else {
            this.authorToEdit_ = false;
        }
    };
    get authorToEdit() {
        return this.authorToEdit_;
    }

    bookToEdit_;
    @api set bookToEdit(value) {
        if (value) {
            const book = JSON.parse(JSON.stringify(value));
            console.log(book);
            this.bookId = book.Id || '';
            this.bookName = book.Name || '';
            this.authorName = book.Author__r.Name || '';
            this.genre = book.Genre__c.split(';') || [];
            this.numberOfPages = book.Number_of_Pages__c || '';
            this.review = book.Review__c || '';
            this.summary = book.Summary__c || '';
            this.imageSource = book.Image_Source__c || '';
            this.bookToEdit_ = book;
        } else {
            this.bookToEdit_ = false;
        }
    };
    get bookToEdit() {
        return this.bookToEdit_;
    }

    genres = [
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

    bookId = '';
    bookName = '';
    authorName = '';
    genre = [];
    numberOfPages = 0;
    review = '';
    summary = '';
    imageSource = '';

    authorId = '';
    nameStr = '';
    fromStr = '';
    bornInStr = '';
    diedInStr = '';
    lifeStr = '';
    imageSourceAuthor = '';
    authorCreated;

    handleInputChange(event) {
        if (event.target.name === 'bookName') {
            this.bookName = event.target.value || '';
        }
        if (event.target.name === 'authorName') {
            this.authorName = event.target.value || '';
        }
        if (event.target.name === 'genres') {
            this.genre = [...event.detail.value];
        }
        if (event.target.name === 'numberOfPages') {
            this.numberOfPages = Number(event.detail.value);
        }
        if (event.target.name === 'review') {
            this.review = event.target.value || '';
        }
        if (event.target.name === 'summary') {
            this.summary = event.target.value || '';
        }
        if (event.target.name === 'imageSource') {
            this.imageSource = event.target.value || '';
        }

        if (event.target.name === 'nameStr') {
            this.nameStr = event.target.value || '';
        }
        if (event.target.name === 'fromStr') {
            this.fromStr = event.target.value || '';
        }
        if (event.target.name === 'bornInStr') {
            this.bornInStr = event.detail.value;
            console.log(this.bornInStr);
        }
        if (event.target.name === 'diedInStr') {
            this.diedInStr = event.detail.value;
            console.log(this.diedInStr);
        }
        if (event.target.name === 'lifeStr') {
            this.lifeStr = event.target.value || '';
        }
        if (event.target.name === 'imageSourceAuthor') {
            this.imageSourceAuthor = event.target.value || '';
        }
    }

    async handleCreateBook() {
        const res = await createBookApex({
            bookName: this.bookName, 
            authorName: this.authorName, 
            genre: this.genre.join(';'), 
            numberOfPages: this.numberOfPages, 
            review: this.review, 
            summary: this.summary, 
            imageSource: this.imageSource
        });
        console.log(res);
        if (res.hasOwnProperty('Name')) {
            this.authorCreated = false;
            this.bookName = ''
            this.authorName = ''
            this.genre = ''
            this.numberOfPages = 0
            this.review = ''
            this.summary = ''
            this.imageSource = ''
            this.dispatchEvent(new CustomEvent('bookcreated', {detail: res}));
        } else {
            const evt = new ShowToastEvent({
                title: 'We couldn\'t save the book.',
                message: 'Please contact your admin.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }
    }

    async handleCreateAuthor() {
        const res = await createAuthorApex({
            authorName: this.nameStr, 
            fromStr: this.fromStr, 
            bornIn: this.bornInStr, 
            diedIn: this.diedInStr, 
            lifeStr: this.lifeStr, 
            imageSource: this.imageSourceAuthor
        });
        console.log(res);
        if (res.hasOwnProperty('Name')) {
            this.authorName = res.Name;
            this.authorCreated = true;
            this.nameStr = '';
            this.fromStr = '';
            this.bornInStr = '';
            this.diedInStr = 0;
            this.lifeStr = '';
            this.imageSourceAuthor = '';
            this.template.querySelector('lightning-tabset').activeTabValue = 'createBook';
        } else {
            this.authorCreated = false;
            const evt = new ShowToastEvent({
                title: 'We couldn\'t create the author.',
                message: 'Please contact your admin.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }
    }

    bookedited
authoredited

    async handleEditBook() {
        const res = await editBookApex({
            bookId: this.bookId,
            bookName: this.bookName, 
            authorName: this.authorName, 
            genre: this.genre.join(';'), 
            numberOfPages: this.numberOfPages, 
            review: this.review, 
            summary: this.summary, 
            imageSource: this.imageSource
        });
        console.log(res);
        if (res.hasOwnProperty('Name')) {
            this.authorCreated = false;
            this.bookName = ''
            this.authorName = ''
            this.genre = ''
            this.numberOfPages = 0
            this.review = ''
            this.summary = ''
            this.imageSource = ''
            this.dispatchEvent(new CustomEvent('bookedited', {detail: res}));
        } else {
            const evt = new ShowToastEvent({
                title: 'We couldn\'t save the book.',
                message: 'Please contact your admin.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }
    }

    async handleEditAuthor() {
        console.log({
            authorId: this.authorId,
            authorName: this.nameStr, 
            fromStr: this.fromStr, 
            bornIn: this.bornInStr, 
            diedIn: this.diedInStr, 
            lifeStr: this.lifeStr, 
            imageSource: this.imageSourceAuthor
        });
        const res = await editAuthorApex({
            authorId: this.authorId,
            authorName: this.nameStr, 
            fromStr: this.fromStr, 
            bornIn: this.bornInStr, 
            diedIn: this.diedInStr, 
            lifeStr: this.lifeStr, 
            imageSource: this.imageSourceAuthor
        });
        console.log(res);
        if (res.hasOwnProperty('Name')) {
            this.nameStr = '';
            this.fromStr = '';
            this.bornInStr = '';
            this.diedInStr = 0;
            this.lifeStr = '';
            this.imageSourceAuthor = '';
            this.dispatchEvent(new CustomEvent('authoredited', {detail: res}));
        } else {
            this.authorCreated = false;
            const evt = new ShowToastEvent({
                title: 'We couldn\'t create the author.',
                message: 'Please contact your admin.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }
    }

    get createBookDisabled(){
        console.log(this.bookName, this.authorName, this.genre, this.numberOfPages);
        return (!this.bookName || !this.bookName.trim()) || (!this.authorName || !this.authorName.trim()) || (!this.genre.length) || this.numberOfPages <= 0;
    } 

    get createAuthorDisabled(){
        return (!this.nameStr || !this.nameStr.trim());
    }
}