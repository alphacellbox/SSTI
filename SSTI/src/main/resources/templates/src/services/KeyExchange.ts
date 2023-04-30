import BigNumber from "bignumber.js";
import * as crypto from "crypto"

export class KeyExchange {
    private lastSecret = 0
    private alphaSeed: string[]


    constructor(
        private prime: number = 263,
        private generator: number = 19,
        private keyLen: number = 32
    ) {
        const str = "ejklRSTaop7AmWXYZGz125BJPbcd834CDHIfg0KLMNOqrst6nQuvwhEFUVi9xy"
        const splt = str.split("")
        this.alphaSeed = splt.slice(1, splt.length - 2)
        this.generateSecret = this.generateSecret.bind(this)
        this.calculateMode = this.calculateMode.bind(this)
        this.calculateShareSecret = this.calculateShareSecret.bind(this)
        this.setSecretKey = this.setSecretKey.bind(this)
        this.getSecretKey = this.getSecretKey.bind(this)
        this.getShareSecret = this.getShareSecret.bind(this)
        this.generateKey = this.generateKey.bind(this)
        this.generateSecret()
    }



    private generateSecret(): number {
        const rnd = KeyExchange.gaussianRandom()
        this.lastSecret = ((parseInt((rnd * 10 + 50).toFixed()) % 50) + 1)
        return this.lastSecret
    }


    private calculateMode(): number {
        return (this.generator.toBigNumber().pow(this.lastSecret).mod(this.prime)).toFixed().toInt()
    }

    private calculateShareSecret(otherSideSecret: number): number {
        return (otherSideSecret.toBigNumber().pow(this.lastSecret).mod(this.prime)).toFixed().toInt()
    }


    public setSecretKey(key: number): KeyExchange {
        this.lastSecret = key
        return this
    }

    public getSecretKey(): number {
        return this.lastSecret
    }

    public getShareSecret(): number {
        return this.calculateMode()
    }

    public generateKey(secret: number, nnc: number): string {
        let len = this.alphaSeed.length
        const nonce = (nnc % 200) + 100
        const centerKey = nonce % len
        let start = centerKey - (this.keyLen / 2)
        let end = centerKey + (this.keyLen / 2)
        if (start < 0) {
            start = 0
            end = this.keyLen
        } else if (end >= len) {
            end = len - 1
            start = end - this.keyLen
        }

        const keySlice = this.alphaSeed.slice(start + 1, end + 1)
        len = keySlice.length
        const shareSec = this.calculateShareSecret(secret)
        let sec = shareSec.toBigNumber().multipliedBy(nonce)

        let index = 0
        while (sec.isGreaterThan(0)) {
            var rem = sec.multipliedBy(nonce.toBigNumber().plus((index + 1).toBigNumber())).mod(len)
            if (rem.isLessThanOrEqualTo(0)) {
                rem = (1).toBigNumber()
            }
            sec = sec.minus(rem)
            var oidx = rem.toFixed().toInt()
            var temp = keySlice[index]
            keySlice[index] = keySlice[oidx]
            keySlice[oidx] = temp

            index = (index + 1) % len
        }
        return keySlice.join("")
    }


    public static gaussianRandom(multiplier: number = 1, bias: number = 0, fix: boolean = false): number {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        num = num / 10.0 + 0.5; // Translate to 0 -> 1

        var ret: number = 0;
        if (num > 1 || num < 0) ret = this.gaussianRandom() // resample between 0 and 1
        else ret = num
        ret = ret * multiplier + bias
        return fix ? parseInt(ret.toFixed()) : ret
    }

    public static hash(data: string, key: string): string {
        var hmac = crypto.createHmac('sha512', key);
        var dig = hmac.update(data, "utf-8").digest();
        return dig.toString('base64');
    }
}

declare global {
    interface Number {
        toBigNumber: () => BigNumber;
    }
    interface String {
        toInt: () => number
        toFloat: () => number
        toBigNumber: () => BigNumber;
    }
}

Number.prototype.toBigNumber = function (): BigNumber {
    return new BigNumber(this)
}

String.prototype.toBigNumber = function (): BigNumber {
    return new BigNumber(this)
}


String.prototype.toInt = function (): number {
    return parseInt(this.toString())
}

String.prototype.toFloat = function (): number {
    return parseFloat(this.toString())
}