class Slider {
    constructor($slider) {
        this.$el = $($slider);
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
            
            playerManager.setCurrentTime(this.value);
        });

    }

    disable() {
        if(!this.disableState) {
            this.disableState = true;
            this.$el.prop( "disabled", this.disableState );
        }
    }

    enable() {
        if(this.disableState) {
            this.disableState = false;
            this.$el.prop( "disabled", this.disableState );
        }
    }

    update() {
        this.getValue();
        this.updateProgress();
    }

    updateProgress() {
        this.$el.css("background", "linear-gradient(to right, #448AFF 0%, #448AFF " + this.value + "%, var(--theme-slider) " + this.value + "%, var(--theme-slider) 100%)");
    }

    getValue() {
        this.value = this.$el.val();
        return this.value;
    }

    setValue(value) {
        this.enable();

        if(this.mouseup && !isNaN(value)) {
            this.$el.val(value);
            this.update();
        }
    }

    onchange(f) {
        this.$el.on("input change", f);
    }

    onmouseup(f) {
       this.$el.mouseup(f); 
       this.$el.bind('touchend', f);
    }

    onmousedown(f) {
       this.$el.mousedown(f); 
       this.$el.bind('touchstart', f);
    }
}
