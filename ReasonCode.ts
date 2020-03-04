enum ReasonCode {
    InvalidParameters
}

function reasonCodeToString(reasonCode: ReasonCode): string {
    switch (reasonCode) {
        case ReasonCode.InvalidParameters:
            return 'Invalid Parameters';
            break;
        default:
            return 'Unknown';
            break;
    }
}