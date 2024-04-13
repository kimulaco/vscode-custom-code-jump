<?php namespace WorkspaceApp\App;

class Web
{
  private $_formValidator;

  public function __construct()
  {
    $this->_formValidator = new CustomClassImporter('\WorkspaceApp\Lib\FormValidator');
  }

  public function validate()
  {
    $this->_formValidator->validate();
  }
}
