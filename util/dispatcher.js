class Dispatcher {
    listeners = {
        GET: new Map(),
        PUT: new Map(),
        POST: new Map(),
        HEAD: new Map(),
        TRACE: new Map(),
        PATCH: new Map(),
        DELETE: new Map(),
        CONNECT: new Map(),
        OPTIONS: new Map(),
    };

    on(method, url, fun) {
        this.listeners[method.toUpperCase()].set(url, fun);
    }

    use(url, finerDispatcher) {
        for (const method in finerDispatcher.listeners) {
            if (finerDispatcher.listeners.hasOwnProperty(method))
                for (const [path, handler] of finerDispatcher.listeners[
                    method
                ]) {
                    this.listeners[method].set(url + path, handler);
                }
        }
    }

    async dispatch(req, res) {
        const baseUrl = "http://" + req.headers.host + "/";
        const pathName = new URL(req.url, baseUrl).pathname;
        for (const [path, handler] of this.listeners[
            req.method.toUpperCase()
        ]) {
            if (
                path instanceof RegExp &&
                path.test(pathName) &&
                !res.finished
            ) {
                await handler(req, res);
            } else if (path === pathName && !res.finished) {
                await handler(req, res);
            }
        }
    }
}

module.exports = Dispatcher;
