import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';

@Injectable()
export class Backend {

  guides: FirebaseListObservable<GuideData[]>;

  constructor(firebase: AngularFireDatabase) {
    this.guides = firebase.list('/guides');
  }

}

export interface GuideData {
  title?: string;
  group?: string;
  content: string;
}
