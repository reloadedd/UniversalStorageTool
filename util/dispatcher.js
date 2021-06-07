class Dispatcher {
    listeners = {
        GET: [],
        PUT: [],
        POST: [],
        HEAD: [],
        TRACE: [],
        PATCH: [],
        DELETE: [],
        CONNECT: [],
        OPTIONS: [],
    };

    on(method, url, fun) {
        this.listeners[method.toUpperCase()].push([url, fun, false]);
    }

    use(url, finerDispatcher) {
        if (finerDispatcher.listeners) {
            for (const method in finerDispatcher.listeners) {
                if (finerDispatcher.listeners.hasOwnProperty(method))
                    for (const [path, handler] of finerDispatcher.listeners[
                        method
                    ]) {
                        this.listeners[method].push([
                            url + path,
                            handler,
                            false,
                        ]);
                    }
            }
            return;
        }

        for (const listenerMethod in this.listeners)
            if (this.listeners.hasOwnProperty(listenerMethod)) {
                this.listeners[listenerMethod].push([
                    url,
                    finerDispatcher,
                    true,
                ]);
            }
    }

    async dispatch(req, res) {
        const baseUrl = "https://" + req.headers.host + "/";
        const pathName = new URL(req.url, baseUrl).pathname;
        for (const list of this.listeners[req.method.toUpperCase()]) {
            if (
                (list[0] instanceof RegExp && list[0].test(pathName)) ||
                list[0] === pathName
            ) {
                await list[1](req, res);
                if (!list[2]) return;
            }
        }
    }
}

module.exports = Dispatcher;
