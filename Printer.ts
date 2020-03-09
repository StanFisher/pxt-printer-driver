class Printer {
    private readonly MaxCoordinate: ICoordinate;

    constructor() {
        this.MaxCoordinate = { x: MaximumPenLocation, y: MaxPaperFeedLocation };
    }

    public initialize(): void {
        motors.resetAll();
    }
}