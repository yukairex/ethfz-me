<template>
    <header style="background-color: #000000;">
        <nav class="navbar is-dark">
            <div class="navbar-brand has-text-white">
                <router-link class="navbar-item"
                             :to="{ name: 'Home'}">
                    <img src="/static/assets/logo.png"> 怡红院首富
                </router-link>
            </div>

            <div class="navbar-end">
            </div>
        </nav>
    </header>
</template>

<script>
    import {getNetwork} from '@/api';

    export default {
        name: 'Header',
        data() {
            return {
                network: {},
                infos: [],
            };
        },
        async created() {
        this.$store.dispatch('initLocale');
        this.$store.dispatch('FETCH_ME');
        const network = await
        getNetwork();
        if (!network) {
            alert('访问本网站必须使用metamask!');
            return;
        }
        this.network = network;
        if (!network.contract) {
            alert(`Unsupported ${network.name}`);
        }
        const infos = [];
        this.infos = infos;
    },
    computed: {
        locale: {
            get() {
                const locale = this.$store.state.locale;
                const i18n = this.$config ? this.$config.i18n : [];
                const lang = i18n.find(item => item.locale === locale || item.aliases.some(alias => alias === locale),);
                return lang ? lang.locale : null;
            },
            set(value)
            {
                this.$store.dispatch('setLocale', value);
            },
        },
        me()
        {
            return this.$store.state.me;
        }
    ,
    }
    ,
    watch: {
        locale(val)
        {
            this.$i18n.locale = val;
        }
    ,
    }
    ,
    }
    ;
</script>

<style>

</style>
