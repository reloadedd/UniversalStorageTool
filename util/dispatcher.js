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
        this.listeners[method.toUpperCase()].push([url, fun]);
    }

    use(url, finerDispatcher) {
        if (finerDispatcher.listeners) {
            for (const method in finerDispatcher.listeners) {
                if (finerDispatcher.listeners.hasOwnProperty(method))
                    for (const [path, handler] of finerDispatcher.listeners[
                        method
                    ]) {
                        this.listeners[method].push([url + path, handler]);
                    }
            }
            return;
        }

        for (const listenerMethod in this.listeners)
            if (this.listeners.hasOwnProperty(listenerMethod)) {
                this.listeners[listenerMethod].push([url, finerDispatcher]);
            }
    }

    async dispatch(req, res) {
        const baseUrl = "https://" + req.headers.host + "/";
        const pathName = new URL(req.url, baseUrl).pathname;
        for (const list of this.listeners[req.method.toUpperCase()]) {
            if (
                (list[0] instanceof RegExp &&
                    list[0].test(pathName) &&
                    !res.finished) ||
                (list[0] === pathName && !res.finished)
            ) {
                await list[1](req, res);
            }
        }
    }
}

module.exports = Dispatcher;
