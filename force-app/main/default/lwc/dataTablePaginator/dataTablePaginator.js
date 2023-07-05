import {subscribe, publish, MessageContext} from 'lightning/messageService';
import DataTablePagination from '@salesforce/messageChannel/DataTablePagination__c';
import { LightningElement, api, wire } from 'lwc';

export default class PaginationComponent extends LightningElement {
    @api currentPage = 1;
    @api totalPages;
    @api pageSize = 10;
    subscription = null; 
    @wire(MessageContext)messageContext;
 
    connectedCallback() {
        this.handleSubscribe();
    }
 
    handleSubscribe() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.messageContext, DataTablePagination, (message) => {
            this.handlePaginationMessage(message);            
        });
    }

    handlePaginationMessage(message){
        if (message.action != 'updateDataSize') {
            return;
        }

        this.totalPages = Math.ceil(message.actionData / this.pageSize);

        let outMessage = {
            action: 'updateTotalPages',
            actionData: {
                totalPages: this.totalPages,
                pageSize: this.pageSize
            }
        };

        publish(this.messageContext, DataTablePagination, outMessage);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    handleFirstPage() {
        this.currentPage = 1;
        this.sendChangeMessage();
    }

    handlePreviousPage() {
        this.currentPage--;
        this.sendChangeMessage();
    }

    handleNextPage() {
        this.currentPage++;
        this.sendChangeMessage();

    }

    handleLastPage() {
        this.currentPage = this.totalPages;
        this.sendChangeMessage();
    }

    sendChangeMessage() {
        let message = {
            action: 'changePage',
            actionData: this.currentPage
        };
        publish(this.messageContext, DataTablePagination, message);
    }
}