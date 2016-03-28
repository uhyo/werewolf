//Event Object
export interface Event{
    //Event type
    type: string;
}

export class EventBase{
    private queue:Array<Event>;
    constructor(){
        this.queue = [];
    }

    public addEvent(e:Event):void{
        this.queue.push(e);
    }
    //It handles Events added on the way.
    public iterateEvent():Event{
        return this.queue.shift();
    }

    public getAdder():EventAdder{
        return new EventAdder(this);
    }
}

//EventBase that only can add new Events.
export class EventAdder{
    constructor(private base:EventBase){
    }
    public addEvent(e:Event):void{
        this.base.addEvent(e);
    }
}
