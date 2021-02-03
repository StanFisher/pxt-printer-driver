const MaxPaperFeedLocation = 325;

class PaperFeed {
    private readonly motor: motors.Motor;

    private currentLocation: number;

    constructor() {
        this.motor = motors.largeB;
    }

    public feedUntilPaperDetected(): void {
        
    }
}