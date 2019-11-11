export default class Player {
    getAction(resolve) {
        document.addEventListener('keydown', function onKeyDown(e) {
            let action = -1;
            if (e.code === 'ArrowRight') action = 1;
            else if (e.code === 'ArrowLeft') action = 0;
            
            if (action != -1) {
                document.removeEventListener('keydown', onKeyDown);
                resolve(action);
            }
        });
    }

    async act() {
        return await new Promise(this.getAction);
    }
}