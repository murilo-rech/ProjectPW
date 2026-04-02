<?php

$this->layout("_theme", []);

?>

<h1>FAQS</h1>

<?php  $this->start("specific-script"); ?>
<script src="<?= url("assets/web/js/faqs.js"); ?>"></script>
<?php $this->end(); ?>
