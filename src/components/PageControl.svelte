<script lang="ts">
    import { PaginationItem, PaginationLink } from "sveltestrap";

    const firstPage: number = 1;
    let lastPage: number = firstPage;
    $: lastPage = Math.max(Math.ceil(total / perPage), 1);
    $: if (page > lastPage) {
        page = lastPage;
    }

    export let page: number = firstPage;
    export let total: number;

    export let perPage: number;
    export let lookaround: number = 2;

    let pages: number[] = [1];
    $: {
        const start = Math.max(
            Math.min(page - lookaround, lastPage - 2 * lookaround),
            firstPage
        );
        const end = Math.min(
            Math.max(page + lookaround, firstPage + 2 * lookaround),
            lastPage
        );
        pages = Array.from({ length: end - start + 1 }, (_, i) => i + start);
    }

    const setPage =
        (p: number): ((e: Event) => void) =>
        (e: Event) => {
            e.preventDefault();
            page = p;
        };
    const incPage = (e: Event) => {
        e.preventDefault();
        page++;
    };
    const decPage = (e: Event) => {
        e.preventDefault();
        page--;
    };
</script>

<nav aria-label="Page control">
    <ul class="pagination justify-content-center">
        <PaginationItem disabled={page <= 1}>
            <PaginationLink first on:click={setPage(1)} />
        </PaginationItem>
        <PaginationItem disabled={page <= 1}>
            <PaginationLink previous on:click={decPage} />
        </PaginationItem>
        {#each pages as p}
            <PaginationItem active={p === page}>
                <PaginationLink on:click={setPage(p)}>{p}</PaginationLink>
            </PaginationItem>
        {/each}
        <PaginationItem disabled={page >= lastPage}>
            <PaginationLink next on:click={incPage} />
        </PaginationItem>
        <PaginationItem disabled={page >= lastPage}>
            <PaginationLink last on:click={setPage(lastPage)} />
        </PaginationItem>
    </ul>
</nav>
