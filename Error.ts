class Error {
    public static raise(functionName: string, code: ReasonCode, message: string): void {
        motors.stopAll();
        
        brick.clearScreen();
        brick.setStatusLight(StatusLight.RedFlash);

        brick.showString(`ERROR: ${functionName}`, 1);
        brick.showString(reasonCodeToString(code), 2);
        brick.showString(message, 3);

        music.playSoundEffectUntilDone(sounds.informationErrorAlarm);
    }
}