import { KeyExchange } from "./KeyExchange"
export class Controler {
    private static keyxchange: KeyExchange = new KeyExchange
    private static header: Record<string, string> = {
        'Content-Type': 'application/json',
        'mode': 'no-cors',
        'cache': 'no-cache',
        'credentials': 'include',
        'redirect': 'follow',
        'referrerPolicy': 'no-referrer'
    }
    private static serverShareKey: number
    static setServerKey(key: number) {
        Controler.serverShareKey = key
    }
    static setSecret(key: number) {
        this.keyxchange.setSecretKey(key)
    }
    static getShareSecretKey() {
        return this.keyxchange.getShareSecret()
    }
    static islogged() {
        return typeof Controler.header["Authorization"] !== typeof undefined
    }
    static setAuth(nonce: number, hash: string): Record<string, string> {
        const header = JSON.parse(JSON.stringify(Controler.header)) as Record<string, string>
        header["x-nonce"] = nonce.toString()
        header["x-hash"] = hash.toString()
        return header
    }
    static setToken(str: string) {
        Controler.header["Authorization"] = str.toString()
    }

    static async secureRequest<T, X>(address: string, body: T, method: "POST" | "PUT" | "DELETE"): Promise<X | null> {
        if (!this.islogged()) {
            return null // error
        }
        let ret: X | null = null;
        try {
            const content = {
                method,
                headers: Controler.header,
                body: ""
            }

            // body myst not be empty
            content.body = JSON.stringify(body)
            const nonce = KeyExchange.gaussianRandom(100, 100, true);
            // var nonce = 321;
            const key = Controler.keyxchange.generateKey(Controler.serverShareKey, nonce)
            const xhash = KeyExchange.hash(content.body, key)
            // console.log("Xhash", xhash, nonce, content.body, key, Controler.serverShareKey, Controler.getShareSecretKey()) // TODO REMOVE IT
            const Sheaders = Controler.setAuth(nonce, xhash)
            content.headers = { ...content.headers, ...Sheaders }

            const req = await fetch(address, content)
            ret = await req.json() as X
        }
        catch (e) { console.log("1Sorry Your Api have Problem ===>", e) }
        return ret
    }
    static async rawRequest<T extends object, X>(address: string, body: T, method: "GET" | "POST" | "PUT" | "DELETE"): Promise<X | null> {
        let ret: X | null = null;
        try {
            const content = {
                method,
                headers: Controler.header,
                body: ""
            }
            if (method === "GET") {
                address += "?"
                const data: string[] = []
                for (const i in body) {
                    data.push(i + "=" + body[i].toString())
                }
                address += data.join("&")
            }
            else {
                content.body = JSON.stringify(body)
            }
            console.log("🚀 ~ file: controler.tsx ~ line 81 ~ Controler ~ content.body", content.body)

            const req = await fetch(address, content)
            ret = await req.json() as X
        }
        catch (e) { console.log("1Sorry Your Api have Problem ===>", e) }
        return ret
    }
}
