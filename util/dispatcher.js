class Dispatcher {
    listeners = {
        'GET': new Map(),
        'PUT': new Map(),
        'POST': new Map(),
        'HEAD': new Map(),
        'TRACE': new Map(),
        'PATCH': new Map(),
        'DELETE': new Map(),
        'CONNECT': new Map(),
        'OPTIONS': new Map()
    };

    on = (method, url, fun) => {
        this.listeners[method.toUpperCase()].set(url, fun);
    };

    use = (url, finerDispatcher) => {
        for(let method in finerDispatcher.listeners){
            for(let [path, handler] of finerDispatcher.listeners[method]){
                this.listeners[method].set(url + path, handler);
            }
        }
    };


    dispatch = (req, res) => {
        let baseUrl = 'http://' + req.headers.host + '/';
        let pathName = (new URL(req.url, baseUrl)).pathname;
        if(this.listeners[req.method.toUpperCase()].get(pathName)) {
            this.listeners[req.method.toUpperCase()].get(pathName)(req, res);
        }
        else{
            for(let method in this.listeners){
                for(let [path, handler] of this.listeners[method]){
                    if(path instanceof RegExp && path.test(pathName)) {
                        handler(req, res);
                    }
                }
            }
        }
    };
}

module.exports = Dispatcher;