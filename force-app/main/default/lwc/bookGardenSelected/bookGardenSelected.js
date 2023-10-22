import { LightningElement, api, wire } from 'lwc';
import Id from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import UserNameFIELD from '@salesforce/schema/User.Name';
import LibrarianFIELD from '@salesforce/schema/User.Librarian__c';
import getAuthorBooksApex from "@salesforce/apex/BookGardenController.getAuthorBooks";

export default class BookGardenSelected extends LightningElement {
    userId = Id;
    title = 'Select a Book';
    author = {};
    authorBooks = [];
    book_;
    renderComments = false;
    bookCreatedDate = '';
    @api set book(value) {
        if (value) {
            const book = JSON.parse(JSON.stringify(value));
            book.genres = book.Genre__c.split(';');
            if (book.hasOwnProperty('Comments__r')) {
                book.Comments__r = book.Comments__r.map(comment => {
                    comment.commentCreatedDate = comment.CreatedDate.slice(0, 10);
                    return comment;
                });
            }
            this.book_ = book;
            this.title = this.book_.Name;
            this.className = "selected-content has-book";
            this.renderComments = book.hasOwnProperty('Comments__r');
            this.bookCreatedDate = book.CreatedDate.slice(0, 10);
            this.textareaPlaceholder = book.Archived__c ? "Can't comment on archived books" : "This is a great recommendation!";
            this.setAuthorInfo();
            getAuthorBooksApex({authorId:this.book_.Author__c, authorName:this.book_.Author__r.Name})
            .then(res => {
                if (res) {
                    this.authorBooks = JSON.parse(JSON.stringify(res));
                } else {
                    this.authorBooks = [];
                }
            })
        } else {
            this.book_ = false;
            this.title = 'Select a Book';
            this.className = "selected-content";
        }
    }

    get book() {
        return this.book_;
    }

    get ableToEdit() {
        console.log(this.book.CreatedBy);
        console.log('ABLE TO EDIT', (this.book.CreatedBy.Id === this.userId || this.currentUserLibrarian));
        return (this.book.CreatedBy.Id === this.userId || this.currentUserLibrarian);
    }

    currentUserName = '';
    currentUserLibrarian = false;
    @wire(getRecord, { recordId: Id, fields: [UserNameFIELD, LibrarianFIELD]}) 
    currentUserInfo({error, data}) {
        if (data) {
            this.currentUserName = data.fields.Name.value;
            this.currentUserLibrarian = data.fields.Librarian__c.value;
        } else if (error) {
            this.currentUserName = '';
            this.currentUserLibrarian = '';
            this.error = error ;
        }
    }

    get reactionDisabled() {
        return (!this.book || (this.book && this.book.Archived__c));
    }

    setAuthorInfo() {
        if (this.book.hasOwnProperty('Author__r')) {
            const author = JSON.parse(JSON.stringify(this.book.Author__r));
            let diedIn = '????';
            if (!author.hasOwnProperty('Died_In__c') && author.hasOwnProperty('Born_In__c')) {
                diedIn = 'Present';
            } else if (author.hasOwnProperty('Died_In__c')) {
                diedIn = author.Died_In__c;
            }
            const bornInDiedIn = `${author.hasOwnProperty('Born_In__c') ? author.Born_In__c : '????'} / ${diedIn}`
            const From = `${author.hasOwnProperty('From__c') ? author.From__c : '????'}`
            const Life = `${author.hasOwnProperty('Life__c') ? author.Life__c : 'We don\'t know...'}`
            const Profile = author.hasOwnProperty('Image_Source__c') ? author.Image_Source__c : 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png';
            this.author = {Name: author.Name, Id: author.Id, bornInDiedIn, From, Life, Profile};
        } else {
            const authorName = this.book.hasOwnProperty('Author_Name__c') ? this.book.Author_Name__c : '????? ??????';
            this.author = {Name: authorName, Id: '', bornInDiedIn: '????-????', From: '????', Life: 'We don\'t know...', Profile: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png'};
        }
    }

    handleReactToBook(event) {
        let amount = 0;
        if (event.target.name === 'like') {
            amount = this.book.hasOwnProperty('Likes__c') ? this.book.Likes__c + 1 : 1;
        } else {
            amount = this.book.hasOwnProperty('Dislikes__c') ? this.book.Dislikes__c + 1 : 1;
        }
        this.dispatchEvent(new CustomEvent('reactedtobook', {detail:{reaction: event.target.name, bookId: this.book.Id, amount}}))
    }

    
    comment = '';

    get commentDisabled() {
        return this.comment.trim().length === 0 && this.comment.length < 256;
    }

    handleCommentChange(event) {
        if(event.target.value !== 'This is a great recommendation!') {
            this.comment = event.target.value;
        }
    }

    handleComment() {
        if (this.comment && !this.book.Archived__c) {
            const tempCommentObj = {
                Name:'123',
                Comment__c:this.comment,
                CreatedBy: {
                    Name: this.currentUserName,
                    SmallPhotoUrl:'https://osfdigital-4bf-dev-ed.develop.file.force.com/profilephoto/005/T'
                },
                commentCreatedDate: new Date().toISOString().split('T')[0]
            };

            if (this.book.hasOwnProperty('Comments__r')) {
                this.book.Comments__r.push(tempCommentObj);
            } else {
                this.book.Comments__r = [tempCommentObj];
            }
            this.renderComments = false;
            this.renderComments = true;

            this.dispatchEvent(new CustomEvent('commentedonbook', {detail: {bookId: this.book.Id, comment: this.comment}}));

            [...this.template
                .querySelectorAll('lightning-textarea')]
                .forEach((input) => { input.value = ''; });
        }
    }

    handleEditBook() {
        if (this.ableToEdit) {
            this.dispatchEvent(new CustomEvent('editbook', {detail: {bookToEdit: this.book}}));
        } 
    }

    handleEditAuthor() {
        if (this.ableToEdit) {
            this.dispatchEvent(new CustomEvent('editauthor', {detail: {authorToEdit: this.book.Author__r}}));
        } 
    }

    handleArchiveBook() {
        if(this.ableToEdit) {
            this.dispatchEvent(new CustomEvent('archivebook', {detail: {bookId: this.book.Id, archived: !this.book.Archived__c}}));
        }
    }

    handleDeleteBook() {
        if(this.ableToEdit) {
            this.dispatchEvent(new CustomEvent('deletebook', {detail: {bookId: this.book.Id}}));
        }
    }

}