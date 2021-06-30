import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-server-error-message',
  templateUrl: './server-error-message.component.html',
  styleUrls: ['./server-error-message.component.css']
})
export class ServerErrorMessageComponent implements OnInit {
  @Input('server-error-messages') serverErrorMessages: string[] = null;

  constructor() {}
  ngOnInit(): void {}
}
