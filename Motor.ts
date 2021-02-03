class MotorHelper {
    public static setDefaults(motor: motors.Motor): void {
        if (motor) {
            motor.reset();
            motor.setBrake(true);
            motor.setInverted(true);
        }
    }
}