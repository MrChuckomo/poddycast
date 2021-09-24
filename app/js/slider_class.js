class Slider {
    constructor() {
        this.$el = document.getElementById('slider');
        this.value = 0;
        this.mouseup = true;

        this.disable();
        this.init();

    }

    init() {
        this.onchange(() => { 
            this.update();
        });

        this.onmousedown(() => {
            this.mouseup = false;
        });

        this.onmouseup(() => {
            this.mouseup = true;

            seekProgress(this.value);
        });

    }

    disable() {
        if(!this.disableState) {
            this.disableState = true;
            this.$el.setAttribute( "disabled", '' );
        }
    }

    enable() {
        if(this.disableState) {
            this.disableState = false;
            this.$el.removeAttribute( "disabled" );
        }
    }

    update() {
        this.getValue();
        this.updateProgress();
    }

    updateProgress() {
        this.$el.style.background = "linear-gradient(to right, #448AFF 0%, #448AFF " + this.value + "%, var(--theme-slider) " + this.value + "%, var(--theme-slider) 100%)";
    }

    getValue() {
        this.value = this.$el.value;
        return this.value;
    }

    setValue(value) {
        this.enable();

        if(this.mouseup && !isNaN(value)) {
            this.$el.value = value;
            this.update();
        }
    }

    onchange(f) {
        this.$el.addEventListener("input", f, false); 
        this.$el.addEventListener("change", f, false); 
    }

    onmouseup(f) {
       this.$el.addEventListener('mouseup', f, false); 
       this.$el.addEventListener('pointerup', f, false); 
       this.$el.addEventListener('touchend', f, false);
    }

    onmousedown(f) {
       this.$el.addEventListener('mousedown', f, false); 
       this.$el.addEventListener('pointerdown', f, false); 
       this.$el.addEventListener('touchstart', f, false);
    }
}
