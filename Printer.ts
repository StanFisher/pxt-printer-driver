class Printer {
    private readonly MaxCoordinate: ICoordinate;

    constructor() {
        this.MaxCoordinate = { x: 285, y: 325 };
    }

    public initialize(): void {
        motors.resetAll();
    }
}