export abstract class Observer<T> {
  abstract update(nextState: T | null): void;
}
export abstract class Subject<T> {
  private observers: Set<Observer<T>> = new Set<Observer<T>>();
  private state: T | null = null;

  public getState() {
    return this.state;
  }

  public setState(nextState: T) {
    if(nextState === this.state){
      return;
    }
    this.state = nextState;
    this.notify();
  }

  public attach(observer: Observer<T>) {
    this.observers.add(observer);
  }

  public detach(observer: Observer<T>) {
    this.observers.delete(observer);
  }

  private notify() {
    this.observers.forEach(item => item.update(this.state));
  }
}